import { Controller, Get, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../auth/decorators/public.decorator";
import { SeoService } from "./seo.service";
import { Response } from "express";

@ApiTags("seo")
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) { }

  @Get("sitemap.xml")
  @Public()
  @ApiOperation({ summary: "XML sitemap for explys.com" })
  async getSitemap(@Res() res: Response) {
    const xml = await this.seoService.buildSitemapXml();

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    return res.status(200).send(xml);
  }
}