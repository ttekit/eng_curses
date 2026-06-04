import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ClassAssignmentDto } from "./teacher-upload-content.dto";

export class AssignExistingContentDto {
  @ApiProperty({ type: [ClassAssignmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassAssignmentDto)
  classAssignments: ClassAssignmentDto[];
}
