import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
} from '@nestjs/common';
import { SimulationService } from './simulation.service';

@Controller('simulation')
export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  @Get()
  getState() {
    return this.simulationService.getState();
  }

  @Post('start')
  start() {
    return this.simulationService.start();
  }

  @Post('stop')
  stop() {
    return this.simulationService.stop();
  }

  @Post('step')
  step() {
    return this.simulationService.step();
  }

  @Patch('speed')
  updateSpeed(@Body('daysPerTick') daysPerTick: number) {
    return this.simulationService.setSpeed(daysPerTick);
  }
}