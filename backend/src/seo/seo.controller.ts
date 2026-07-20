import { Controller, Get, Logger, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Public } from "../auth/decorators/public.decorator";
import { SkipSubscriptionCheck } from "../auth/decorators/skip-subscription-check.decorator";
import { MARKETING_SITEMAP_ROUTES } from "./marketing-sitemap.routes";
import { SeoService } from "./seo.service";

@ApiTags("seo")
@Controller()
export class SeoController {
  private readonly logger = new Logger(SeoController.name);

  constructor(private readonly seoService: SeoService) {}

  @Get("sitemap.xml")
  @Public()
  @SkipSubscriptionCheck()
  @ApiOperation({ summary: "XML sitemap for explys.com" })
  async getSitemap(@Res() res: Response): Promise<void> {
    try {
      const xml = await this.seoService.buildSitemapXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
      res.status(200).send(xml);
    } catch (error) {
      this.logger.error(
        "Sitemap build failed; serving minimal marketing fallback",
        error instanceof Error ? error.stack : String(error),
      );
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.status(200).send(this.buildFallbackSitemapXml());
    }
  }

  private buildFallbackSitemapXml(): string {
    const locs = MARKETING_SITEMAP_ROUTES.map((route) => {
      const loc =
        route.path === "/" ?
          "https://explys.com/"
        : `https://explys.com${route.path}`;
      return `  <url><loc>${loc}</loc></url>`;
    }).join("\n");
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      locs,
      "</urlset>",
    ].join("\n");
  }
}
