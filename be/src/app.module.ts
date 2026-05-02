import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SegmentModule } from './segment/segment.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [PrismaModule, SegmentModule, UserModule, SimulationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
