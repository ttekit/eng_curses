// changelog.dto.ts
import { IsString, IsOptional, IsNotEmpty, IsBoolean } from "class-validator";

export class CreateChangelogDto {
  @IsString()
  @IsNotEmpty()
  titleUk: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsString()
  @IsNotEmpty()
  contentUk: string;

  @IsString()
  @IsNotEmpty()
  contentEn: string;

  @IsOptional()
  @IsString()
  version?: string;
  
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateChangelogDto {
  @IsOptional()
  @IsString()
  titleUk?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  contentUk?: string;

  @IsOptional()
  @IsString()
  contentEn?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
