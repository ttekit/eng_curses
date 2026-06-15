import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { RegisterStudentNameRowDto } from "./register-student-name-row.dto";

export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
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
