// backend/src/users/dto/update-user.dto.ts
import { ApiPropertyOptional, OmitType, PartialType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { CreateUserDto } from "./create-user.dto";

/** * БЕЗОПАСНЫЙ DTO: Используется для обновления собственного профиля пользователем.
 * Исключаем 'role', 'studyingPlanPhases' и 'activeStudyingPhaseIndex'.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    "studyingPlanPhases",
    "activeStudyingPhaseIndex",
    "role",
  ] as const),
) {
  @IsOptional()
  @IsString({ message: "Name must be a string." })
  @IsNotEmpty({ message: "Name is required." })
  name?: string;

  @IsOptional()
  @IsString({ message: "Email must be a string." })
  @IsEmail({}, { message: "Incorrect email format." })
  @IsNotEmpty({ message: "Email is required." })
  email?: string;

  @IsOptional()
  @IsBoolean({ message: "isTwoFactorEnabled must be a boolean value." })
  @Transform(({ value }) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return false;
  })
  isTwoFactorEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playbackSpeed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currentResolution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dailyReminderEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  weeklyReportEnabled?: boolean;
}

/** * АДМИНСКИЙ DTO: Позволяет менять критические поля.
 */
export class AdminUpdateUserDto extends UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasCompletedPlacement?: boolean;
}
