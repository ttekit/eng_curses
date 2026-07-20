import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { PrismaService } from "../prisma.service";
import { SeoService } from "./seo.service";

describe("SeoService", () => {
  let service: SeoService;

  const prismaMock = {
    content: {
      findMany: jest.fn(),
    },
    contentVideo: {
      findMany: jest.fn(),
    },
  };

  const configMock: {
    get: jest.Mock<string | undefined, [string]>;
  } = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    configMock.get.mockImplementation((key: string): string | undefined => {
      switch (key) {
        case "PUBLIC_SITE_URL":
          return "https://explys.com";
        default:
          return undefined;
      }
    });

    prismaMock.content.findMany.mockResolvedValue([]);
    prismaMock.contentVideo.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeoService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ConfigService,
          useValue: configMock,
        },
      ],
    }).compile();

    service = module.get<SeoService>(SeoService);
  });

  it("builds marketing sitemap without querying catalog by default", async () => {
    const xml = await service.buildSitemapXml();

    expect(prismaMock.content.findMany).not.toHaveBeenCalled();

    expect(xml).toContain("<loc>https://explys.com/</loc>");
    expect(xml).toContain("<loc>https://explys.com/pricing</loc>");
    expect(xml).toContain("<loc>https://explys.com/about</loc>");
    expect(xml).toContain("<loc>https://explys.com/terms</loc>");
    expect(xml).toContain("<loc>https://explys.com/privacy</loc>");
    expect(xml).not.toContain("/login");
    expect(xml).not.toContain("/register");
  });

  it("skips null lastmod values for catalog entries", async () => {
    configMock.get.mockImplementation((key: string): string | undefined => {
      switch (key) {
        case "PUBLIC_SITE_URL":
          return "https://explys.com";
        case "SEO_SITEMAP_INCLUDE_PUBLIC_CATALOG":
          return "true";
        default:
          return undefined;
      }
    });

    prismaMock.content.findMany.mockResolvedValue([
      {
        friendlyLink: "business-english",
        updateAt: null,
      },
    ]);

    prismaMock.contentVideo.findMany.mockResolvedValue([
      {
        id: 42,
        content: {
          category: {
            updateAt: null,
          },
        },
      },
      {
        id: 99,
        content: null,
      },
    ]);

    const xml = await service.buildSitemapXml();

    expect(xml).toContain(
      "<loc>https://explys.com/catalog/series/business-english</loc>",
    );

    expect(xml).toContain("<loc>https://explys.com/content/42</loc>");
    expect(xml).toContain("<loc>https://explys.com/content/99</loc>");

    expect(xml).not.toContain("<lastmod>");
  });

  it("returns marketing URLs when catalog queries fail", async () => {
    configMock.get.mockImplementation((key: string): string | undefined => {
      switch (key) {
        case "PUBLIC_SITE_URL":
          return "https://explys.com";
        case "SEO_SITEMAP_INCLUDE_PUBLIC_CATALOG":
          return "true";
        default:
          return undefined;
      }
    });

    prismaMock.content.findMany.mockRejectedValue(
      new Error("db unavailable"),
    );

    const xml = await service.buildSitemapXml();

    expect(xml).toContain("<loc>https://explys.com/</loc>");
    expect(xml).toContain("<loc>https://explys.com/pricing</loc>");
    expect(xml).not.toContain("/catalog/series/");
  });
});