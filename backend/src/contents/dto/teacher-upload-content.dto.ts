import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, MaxLength, MinLength } from "class-validator";

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
}
