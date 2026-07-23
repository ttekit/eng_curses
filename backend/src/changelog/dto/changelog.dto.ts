import { IsString, IsOptional, IsNotEmpty, IsBoolean } from "class-validator";

export class CreateChangelogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

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
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
