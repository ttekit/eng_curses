import { IsBoolean, IsInt, IsNumber, Min } from "class-validator";

export class ProgressInteractDto {
  @IsInt()
  @Min(1)
  wordId!: number;

  @IsBoolean()
  isCorrect!: boolean;

  @IsNumber()
  @Min(0)
  timeSinceLastReview!: number;
}
