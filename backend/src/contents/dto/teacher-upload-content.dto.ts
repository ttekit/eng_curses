import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsISO8601,
} from "class-validator";

export class TeacherUploadContentDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: ["public", "unlisted"] })
  @IsString()
  @IsIn(["public", "unlisted"])
  visibility: "public" | "unlisted";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  availableFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  deadline?: string;

  @IsString()
  @IsOptional()
  ageRestriction?: string;
}
