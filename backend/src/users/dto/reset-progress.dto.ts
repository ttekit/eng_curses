// backend/src/users/dto/reset-progress.dto.ts
import { IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetProgressDto {
  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "Code must be exactly 6 characters long" })
  code: string;
}
