import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class ConfirmationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
