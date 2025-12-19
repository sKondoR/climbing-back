import { Controller, Get, Delete } from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto';
import { ScheduleService } from './schedule.service';
import { SCHEDULE } from '../migrate/data/schedule';

@Controller('schedule-migrate')
export class ScheduleFullController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async create() {
    await this.scheduleService.removeAll();
    return SCHEDULE.map(async (event) => {
      return this.scheduleService.create(event as CreateEventDto);
    });
  }

  @Delete()
  async removeAll() {
    await this.scheduleService.removeAll();
    return { message: 'All events removed.' };
  }
}
