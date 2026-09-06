import { PartialType } from "@nestjs/mapped-types";
import { CreateContentVideoDto } from "./create-content-video.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateContentVideoDto extends PartialType(CreateContentVideoDto) {
    @IsOptional()
    @IsString()
    cefrLevel?: string | null;
}
