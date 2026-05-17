import { ApiProperty } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsInt } from "class-validator";

export class ReorderContentPlaylistDto {
  @ApiProperty({ type: [Number], description: "Every ContentMedia id for the series, in order" })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  orderedContentMediaIds: number[];
}
