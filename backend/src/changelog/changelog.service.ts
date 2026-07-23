import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma.service";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

@Injectable()
export class ChangelogService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.bucket = this.configService.getOrThrow<string>("AWS_S3_BUCKET_NAME");
    this.region =
      this.configService.get<string>("AWS_S3_REGION") ??
      this.configService.getOrThrow<string>("AWS_REGION");
    this.s3Client = new S3Client({
      region: this.region,
    });
  }

  private async uploadImageToS3(file: Express.Multer.File): Promise<string> {
    const key = `changelogs/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "")}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async create(data: any, file?: Express.Multer.File) {
    let imageUrl = null;

    if (file) {
      imageUrl = await this.uploadImageToS3(file);
    }

    return this.prisma.changelog.create({
      data: {
        title: data.title,
        content: data.content,
        version: data.version || null,
        isPublished: data.isPublished === "true" || data.isPublished === true,
        imageUrl: imageUrl,
      },
    });
  }

  async update(id: number, data: any, file?: Express.Multer.File) {
    const existingLog = await this.prisma.changelog.findUnique({
      where: { id },
    });
    if (!existingLog) throw new NotFoundException("Changelog not found");

    let imageUrl = existingLog.imageUrl;

    if (file) {
      if (existingLog.imageUrl) {
        await this.deleteImageFromS3(existingLog.imageUrl);
      }
      imageUrl = await this.uploadImageToS3(file);
    } else if (data.removeImage === "true") {
      if (existingLog.imageUrl) {
        await this.deleteImageFromS3(existingLog.imageUrl);
      }
      imageUrl = null;
    }

    return this.prisma.changelog.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        version: data.version || null,
        isPublished: data.isPublished === "true" || data.isPublished === true,
        imageUrl: imageUrl,
      },
    });
  }

  async findOne(id: number) {
    const log = await this.prisma.changelog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException("Changelog not found");
    return log;
  }

  async remove(id: number) {
    const log = await this.prisma.changelog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException("Changelog not found");

    if (log.imageUrl) {
      await this.deleteImageFromS3(log.imageUrl);
    }

    return await this.prisma.changelog.delete({ where: { id } });
  }

  async findPublished() {
    return this.prisma.changelog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllForAdmin() {
    return this.prisma.changelog.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  private async deleteImageFromS3(imageUrl: string) {
    try {
      const urlParts = imageUrl.split("/");
      const key = urlParts.slice(3).join("/");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.error("Error deleting file from S3:", error);
    }
  }
}
