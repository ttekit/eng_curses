import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class ToggleTwoFactorDto {
  @IsBoolean()
  enable: boolean;

  @IsString()
  @IsNotEmpty()
  password: string; 
}