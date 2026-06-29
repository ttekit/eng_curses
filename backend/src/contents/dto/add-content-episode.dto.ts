import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength, IsOptional } from "class-validator";

export class AddContentEpisodeDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  videoName: string;

  @ApiProperty({ required: false })
  @IsString()
  @MaxLength(4000)
  videoDescription?: string;

  @IsString()
  @IsOptional()
  ageRestriction?: string;

  @IsOptional()
  @IsString()
  friendlyLink?: string;
}
