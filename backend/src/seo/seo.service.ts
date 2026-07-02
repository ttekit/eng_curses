import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma.service";

type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  alternates?: { hreflang: string; href: string }[];
};

/**
 * Builds XML sitemaps for public marketing routes (Path A) and optional public catalog URLs (Path B).
 */
@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private resolveSiteOrigin(): string {
    const configured =
      this.config.get<string>("PUBLIC_SITE_URL")?.trim() ||
      this.config.get<string>("FRONTEND_URL")?.trim() ||
      "https://explys.com";
    return configured.replace(/\/+$/, "");
  }

  private includePublicCatalogUrls(): boolean {
    const raw = this.config.get<string>("SEO_SITEMAP_INCLUDE_PUBLIC_CATALOG");
    return raw === "1" || raw === "true" || raw === "yes";
  }

  private formatLastmod(value: Date | null | undefined): string | undefined {
    return value ? value.toISOString().slice(0, 10) : undefined;
  }

  private buildMarketingEntries(origin: string): SitemapUrlEntry[] {
    return [
      {
        loc: `${origin}/`,
        changefreq: "weekly",
        priority: "1.0",
        alternates: [
          { hreflang: "en", href: `${origin}/` },
          { hreflang: "uk", href: `${origin}/?lang=uk` },
          { hreflang: "x-default", href: `${origin}/` },
        ],
      },
      {
        loc: `${origin}/pricing`,
        changefreq: "monthly",
        priority: "0.8",
        alternates: [
          { hreflang: "en", href: `${origin}/pricing` },
          { hreflang: "uk", href: `${origin}/pricing?lang=uk` },
          { hreflang: "x-default", href: `${origin}/pricing` },
        ],
      },
    ];
  }

  private async buildPublicCatalogEntries(origin: string): Promise<SitemapUrlEntry[]> {
    const entries: SitemapUrlEntry[] = [];
    const publicSeries = await this.prisma.content.findMany({
      where: { visibility: "public" },
      select: {
        friendlyLink: true,
        updateAt: true,
      },
    });
    for (const series of publicSeries) {
      if (!series.friendlyLink) {
        continue;
      }
      entries.push({
        loc: `${origin}/catalog/series/${encodeURIComponent(series.friendlyLink)}`,
        lastmod: this.formatLastmod(series.updateAt),
        changefreq: "weekly",
        priority: "0.6",
      });
    }
    const publicVideos = await this.prisma.contentVideo.findMany({
      where: {
        content: {
          category: {
            visibility: "public",
          },
        },
      },
      select: {
        id: true,
        content: {
          select: {
            category: {
              select: { updateAt: true },
            },
          },
        },
      },
    });
    for (const video of publicVideos) {
      const updateDate = video.content?.category?.updateAt;
      entries.push({
        loc: `${origin}/content/${video.id}`,
        lastmod: this.formatLastmod(updateDate),
        changefreq: "weekly",
        priority: "0.5",
      });
    }
    return entries;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  private renderUrl(entry: SitemapUrlEntry): string {
    const parts = [`    <url>`, `      <loc>${this.escapeXml(entry.loc)}</loc>`];
    if (entry.lastmod) {
      parts.push(`      <lastmod>${entry.lastmod}</lastmod>`);
    }
    if (entry.changefreq) {
      parts.push(`      <changefreq>${entry.changefreq}</changefreq>`);
    }
    if (entry.priority) {
      parts.push(`      <priority>${entry.priority}</priority>`);
    }
    if (entry.alternates?.length) {
      for (const alt of entry.alternates) {
        parts.push(
          `      <xhtml:link rel="alternate" hreflang="${this.escapeXml(alt.hreflang)}" href="${this.escapeXml(alt.href)}" />`,
        );
      }
    }
    parts.push(`    </url>`);
    return parts.join("\n");
  }

  /** Generates sitemap XML for crawlers. */
  async buildSitemapXml(): Promise<string> {
    const origin = this.resolveSiteOrigin();
    const urls: SitemapUrlEntry[] = this.buildMarketingEntries(origin);
    if (this.includePublicCatalogUrls()) {
      try {
        const catalogUrls = await this.buildPublicCatalogEntries(origin);
        urls.push(...catalogUrls);
      } catch (error) {
        this.logger.error(
          "Public catalog sitemap entries failed; returning marketing URLs only",
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
    const body = urls.map((entry) => this.renderUrl(entry)).join("\n");
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      body,
      "</urlset>",
    ].join("\n");
  }
}
