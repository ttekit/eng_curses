import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength, MaxLength } from "class-validator";

export class NewPasswordDto {
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      "Password must include at least one uppercase letter, one lowercase letter, and one number",
  })
  password: string;
}
