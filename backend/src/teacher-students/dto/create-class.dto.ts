import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassDto {
  @ApiProperty({ description: "Class Name", example: "Group B1 - Evening" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
