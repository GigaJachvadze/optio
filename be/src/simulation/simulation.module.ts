import { Module } from '@nestjs/common';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { SegmentEvaluatorService } from './segment-evaluator.service';
import { DeltaService } from './delta.service';
import { EventBusService } from './event-bus.service';
import { SimulationGateway } from './simulation.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SimulationController],
  providers: [SimulationService, SegmentEvaluatorService, DeltaService, EventBusService, SimulationGateway],
})
export class SimulationModule {}