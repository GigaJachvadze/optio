import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SegmentService } from './segment.service';
import type { CreateSegmentDto } from './segment.dto';

@Controller('segments')
export class SegmentController {
  constructor(private segmentsService: SegmentService) {}

  @Get()
  getAll() {
    return this.segmentsService.getAll();
  }

  @Get('light')
  getForDelta() {
    return this.segmentsService.getForDelta();
  }

  @Get('search')
  searchSegments(@Query('q') q: string) {
    return this.segmentsService.search(q);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.segmentsService.get(id);
  }

  @Get(':id/members')
  getMembers(@Param('id', ParseIntPipe) id: number) {
    return this.segmentsService.getMembers(id);
  }

  @Post()
  create(@Body() dto: CreateSegmentDto) {
    return this.segmentsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSegmentDto,
  ) {
    return this.segmentsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.segmentsService.delete(id);
  }
}