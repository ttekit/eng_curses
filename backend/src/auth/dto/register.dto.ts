import {
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { RegisterStudentNameRowDto } from "./register-student-name-row.dto";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters long." })
  password: string;

  @IsOptional()
  @ValidateIf((object, value) => value !== "" && value !== null)
  @IsDateString(
    {},
    { message: "Invalid date format. Please use the YYYY-MM-DD format" },
  )
  dateOfBirth?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegisterStudentNameRowDto)
  studentNames?: RegisterStudentNameRowDto[];

  @IsOptional()
  @IsString()
  teacherGrades?: string;

  @IsOptional()
  @IsArray()
  teacherTopics?: string[];

  @IsOptional()
  @IsString()
  englishLevel?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsArray()
  hobbies?: string[];

  @IsOptional()
  @IsString()
  workField?: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsArray()
  knownLanguages?: string[];

  @IsOptional()
  @IsArray()
  knownLanguageLevels?: Array<{ language: string; level: string }>;

  @IsOptional()
  @IsString()
  studentGrade?: string;

  @IsOptional()
  @IsArray()
  studentProblemTopics?: string[];

  @IsOptional()
  @IsArray()
  favoriteGenres?: number[];

  @IsOptional()
  @IsArray()
  hatedGenres?: number[];

  /** Adult: main motivation / destination (e.g. travel to GB). */
  @IsOptional()
  @IsString()
  learningGoal?: string;

  /** Adult: target time horizon (e.g. 3m). */
  @IsOptional()
  @IsString()
  timeToAchieve?: string;

  @IsOptional()
  @IsString()
  captchaToken?: string;

  @IsOptional()
  @IsString()
  clientType?: string;
}
