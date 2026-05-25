import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class AvatarsService {
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

  async uploadAvatar(file: Express.Multer.File) {
    try {
      if (!file || !file.buffer) {
        throw new Error(
          "File or file.buffer is missing. Check Multer memoryStorage configuration.",
        );
      }

      const bucket = this.bucket;
      const key = `avatars/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "")}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const url = `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;

      const newAvatar = await this.prisma.avatar.create({
        data: {
          url: url,
          key: key,
          isActive: true,
        },
      });

      return newAvatar;
    } catch (error) {
      console.error("CRITICAL UPLOAD ERROR:", error);
      throw error;
    }
  }

  async getActiveAvatars() {
    return this.prisma.avatar.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async toggleAvatarStatus(id: number, isActive: boolean) {
    return this.prisma.avatar.update({
      where: { id },
      data: { isActive },
    });
  }
}
