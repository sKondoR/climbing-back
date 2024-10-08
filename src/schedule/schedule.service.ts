import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ScheduleEventEntity } from './entities/schedule-event.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEventEntity)
    private scheduleRepository: Repository<ScheduleEventEntity>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<ScheduleEventEntity> {
    const event = new ScheduleEventEntity();
    event.weekDay = createEventDto.weekDay;
    event.fromTime = createEventDto.fromTime;
    event.toTime = createEventDto.toTime;
    event.place = createEventDto.place;
    event.type = createEventDto.type;
    return await this.scheduleRepository.save(event);
  }

  async findAll(): Promise<ScheduleEventEntity[]> {
    return await this.scheduleRepository.find();
  }

  async findOne(id: number): Promise<ScheduleEventEntity> {
    return await this.scheduleRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
  ): Promise<ScheduleEventEntity> {
    const event = await this.scheduleRepository.findOne({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    event.weekDay = updateEventDto.weekDay;
    event.fromTime = updateEventDto.fromTime;
    event.toTime = updateEventDto.toTime;
    event.place = updateEventDto.place;
    event.type = updateEventDto.type;
    await this.scheduleRepository.update({ id }, event);
    return event;
  }

  async removeAll(): Promise<void> {
    await this.scheduleRepository.delete({});
  }

  async remove(id: number): Promise<void> {
    await this.scheduleRepository.delete(id);
  }
}
