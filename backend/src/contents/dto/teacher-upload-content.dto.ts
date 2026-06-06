import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsISO8601,
  IsArray,
  ValidateNested,
  IsInt,
} from "class-validator";

export class ClassAssignmentDto {
  @ApiProperty()
  @IsInt()
  classId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  availableFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  deadline?: string;
}

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

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassAssignmentDto)
  classAssignments?: ClassAssignmentDto[];
}
