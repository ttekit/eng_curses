import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailChangeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'The code must contain 6 characters' })
  code: string;

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}