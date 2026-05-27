import {
  IsEmail,
  IsString,
  IsOptional,
  IsArray,
  MinLength,
  IsDateString,
  ValidateIf,
} from "class-validator";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
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
  studentNames?: any;

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
  knownLanguageLevels?: any;

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
}
