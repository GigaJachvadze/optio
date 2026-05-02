import { Module } from '@nestjs/common';
import { SegmentController } from './segment.controller';
import { SegmentService } from './segment.service';

@Module({
  controllers: [SegmentController],
  providers: [SegmentService],
})
export class SegmentModule {}