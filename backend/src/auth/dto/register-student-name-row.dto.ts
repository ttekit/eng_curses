import { IsString } from "class-validator";

export class RegisterStudentNameRowDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;
}
