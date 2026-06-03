import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsArray,
  IsNumber,
  IsObject,
  IsIn,
  IsInt,
  Min,
  Allow,
  IsDateString,
  ValidateIf,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      "Password must include at least one uppercase letter, one lowercase letter, and one number",
  })
  password: string;

  @IsOptional()
  @ValidateIf((object, value) => value !== "" && value !== null)
  @IsDateString({}, { message: "Invalid date format. Please use the YYYY-MM-DD format" })
  dateOfBirth?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(["adult", "student", "teacher", "admin"])
  role?: string;

  @IsOptional()
  @IsString()
  englishLevel?: string;

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
  @IsArray()
  @IsNumber({}, { each: true })
  favoriteGenres?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  hatedGenres?: number[];

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  knownLanguages?: string[];

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  knownLanguageLevels?: Array<{ language: string; level: string }>;

  @IsOptional()
  @IsString()
  learningGoal?: string;

  @IsOptional()
  @IsString()
  timeToAchieve?: string;

  /** Full v2 object `{ version: 2, phases, weeklyHabits }`; validated in UsersService. */
  @IsOptional()
  @Allow()
  studyingPlanPhases?: unknown;

  @IsOptional()
  @IsInt()
  @Min(0)
  activeStudyingPhaseIndex?: number;

  /** `CREDENTIALS` or `GOOGLE` — used when creating accounts from OAuth flows. */
  @IsOptional()
  @IsString()
  @IsIn(["CREDENTIALS", "GOOGLE"])
  method?: string;

  /** Optional profile image URL (OAuth); ignored if the schema has no matching column. */
  @IsOptional()
  @IsString()
  picture?: string;
}
