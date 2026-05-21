import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailChangeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Код має містити 6 символів' })
  code: string;

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}