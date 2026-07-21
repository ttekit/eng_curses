import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma.service";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// Убедись, что импортируешь правильные DTO
import { CreateChangelogDto, UpdateChangelogDto } from "./dto/changelog.dto";

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

  // --- Вспомогательный метод для загрузки файла ---
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

  // Для админки: создание записи с опциональной картинкой
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
        isPublished: data.isPublished,
        imageUrl: imageUrl,
      },
    });
  }

  // Для админки: обновление записи с опциональной картинкой
  async update(id: number, data: any, file?: Express.Multer.File) {
    const existingLog = await this.prisma.changelog.findUnique({
      where: { id },
    });
    if (!existingLog) throw new NotFoundException("Changelog not found");

    let imageUrl = existingLog.imageUrl; // Оставляем старую картинку по умолчанию

    // Если пришел новый файл — загружаем его и меняем URL
    if (file) {
      imageUrl = await this.uploadImageToS3(file);
    }

    return this.prisma.changelog.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        version: data.version || null,
        isPublished: data.isPublished,
        imageUrl: imageUrl,
      },
    });
  }

  // Для фронтенда: получить конкретную запись
  async findOne(id: number) {
    const log = await this.prisma.changelog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException("Changelog not found");
    return log;
  }

  // Для админки: удаление
  async remove(id: number) {
    try {
      return await this.prisma.changelog.delete({ where: { id } });
    } catch {
      throw new NotFoundException("Changelog not found");
    }
  }

  // Публичный метод: отдает ТОЛЬКО опубликованные записи
  async findPublished() {
    return this.prisma.changelog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Админский метод: отдает ВСЕ записи (и черновики тоже)
  async findAllForAdmin() {
    return this.prisma.changelog.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
