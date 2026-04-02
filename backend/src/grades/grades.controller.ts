import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateGradeDto } from './dto/create-grade.dto';
import { QueryGradesDto } from './dto/query-grades.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradesService } from './grades.service';
import type { AuthUser } from '../auth/auth-user.interface';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  findAll(@Query() query: QueryGradesDto, @CurrentUser() user: AuthUser) {
    return this.gradesService.findAll(query, user);
  }

  @Post()
  create(@Body() dto: CreateGradeDto, @CurrentUser() user: AuthUser) {
    return this.gradesService.create(dto, user);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGradeDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.gradesService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.gradesService.remove(id, user);
  }
}
