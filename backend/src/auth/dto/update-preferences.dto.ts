import {
  IsArray,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { RegisterStudentNameRowDto } from "./register-student-name-row.dto";
import { UserRole } from "@generated/prisma/enums";

const ALLOWED_PREFERENCE_ROLES = [
  UserRole.ADULT,
  UserRole.STUDENT,
  UserRole.TEACHER,
] as const;

export class UpdatePreferencesDto {
  @IsOptional()
  @IsIn(ALLOWED_PREFERENCE_ROLES, { message: 'Invalid role selection' })
  role?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

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
  @IsString({ each: true })
  teacherTopics?: string[];

  @IsOptional()
  @IsString()
  learningGoal?: string;

  @IsOptional()
  @IsString()
  timeToAchieve?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  workField?: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownLanguages?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  favoriteGenres?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  hatedGenres?: number[];
}
