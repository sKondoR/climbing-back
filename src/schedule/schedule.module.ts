import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleEventEntity } from './entities/schedule-event.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleFullController } from './schedule-migrate.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleEventEntity])],
  controllers: [ScheduleController, ScheduleFullController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
