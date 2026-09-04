import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ContentStatsService } from "./content-stats.service";
import { CreateContentStatsDto } from "./dto/create-content-stats.dto";
import { UpdateContentStatsDto } from "./dto/update-content-stats.dto";
import { JwtAdminGuard } from "src/auth/guards/jwt-admin.guard";

@ApiTags("content-stats")
@Controller("content-stats")
export class ContentStatsController {
  constructor(private readonly contentStatsService: ContentStatsService) { }

  @Post()
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  create(@Body() createContentStatsDto: CreateContentStatsDto) {
    return this.contentStatsService.create(createContentStatsDto);
  }

  @Get()
  findAll() {
    return this.contentStatsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.contentStatsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateContentStatsDto: UpdateContentStatsDto,
  ) {
    return this.contentStatsService.update(id, updateContentStatsDto);
  }

  @Delete(":id")
  @UseGuards(JwtAdminGuard)
  @ApiBearerAuth("JWT-auth")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.contentStatsService.remove(id);
  }
}