import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetProgressDto {
  @ApiProperty({ example: 'your_password_here' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}