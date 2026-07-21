import { IsString, IsOptional, IsInt, IsArray } from "class-validator";

export class CreateConstellationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  rewardId?: number;
}

export class UpdateConstellationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  rewardId?: number;
}

export class CreateStarDto {
  @IsInt()
  constellationId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  contentVideoId?: number;
}

export class UpdateStarDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  contentVideoId?: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  prerequisiteIds?: number[];
}
