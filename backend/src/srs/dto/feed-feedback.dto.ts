import { IsInt, IsNumber, IsString, Min, MinLength } from "class-validator";

export class ContextShiftDto {
  @IsInt()
  @Min(1)
  segmentId!: number;

  @IsString()
  @MinLength(1)
  word!: string;
}

export class WatchFeedbackDto {
  @IsInt()
  @Min(1)
  segmentId!: number;

  @IsNumber()
  @Min(0)
  watchTimeSec!: number;

  @IsNumber()
  @Min(0)
  loopLengthSec!: number;
}
