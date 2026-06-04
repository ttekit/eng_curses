import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class UpdateClassDto {
  @ApiProperty({ description: "New class name", example: "Group B2 - Intensive" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}