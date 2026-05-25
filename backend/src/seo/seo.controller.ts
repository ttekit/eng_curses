import { Controller, Get, Header } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { SeoService } from "./seo.service";

@ApiTags("seo")
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  /**
   * Public sitemap for search engines. Path A includes `/` and `/pricing`.
   * Set `SEO_SITEMAP_INCLUDE_PUBLIC_CATALOG=true` to append public lesson URLs (Path B).
   */
  @Get("sitemap.xml")
  @Public()
  @Header("Content-Type", "application/xml; charset=utf-8")
  @Header("Cache-Control", "public, max-age=3600")
  @ApiOperation({ summary: "XML sitemap for explys.com marketing and optional catalog URLs" })
  async getSitemap(): Promise<string> {
    return this.seoService.buildSitemapXml();
  }
}
