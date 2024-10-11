import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLeadTrainingDto } from './dto/create-lead-training.dto';
import { UpdateLeadTrainingDto } from './dto/update-lead-training.dto';
import { LeadTrainingEntity } from './entities/lead-training.entity';

@Injectable()
export class LeadTrainingService {
  constructor(
    @InjectRepository(LeadTrainingEntity)
    private leadTrainingRepository: Repository<LeadTrainingEntity>,
  ) {}

  async create(
    createLeadTrainingDto: CreateLeadTrainingDto,
  ): Promise<LeadTrainingEntity> {
    const training = new LeadTrainingEntity();
    training.userId = createLeadTrainingDto.userId;
    training.date = createLeadTrainingDto.date;
    training.routes = createLeadTrainingDto.routes;
    training.withStops = createLeadTrainingDto.withStops;
    training.topRopes = createLeadTrainingDto.topRopes;
    return await this.leadTrainingRepository.save(training);
  }

  async findAll(): Promise<LeadTrainingEntity[]> {
    return await this.leadTrainingRepository.find();
  }

  async findOne(id: number): Promise<LeadTrainingEntity> {
    return await this.leadTrainingRepository.findOne({ where: { id } });
  }

  async findAllByUser(userId: number): Promise<LeadTrainingEntity[]> {
    return await this.leadTrainingRepository.find({ where: { userId } });
  }

  async update(
    id: number,
    updateLeadTrainingDto: UpdateLeadTrainingDto,
  ): Promise<LeadTrainingEntity | string> {
    const training = await this.leadTrainingRepository.findOne({
      where: { id },
    });
    if (!training) {
      throw new NotFoundException('lead training not found');
    }
    training.date = updateLeadTrainingDto.date;
    training.routes = updateLeadTrainingDto.routes;
    training.withStops = updateLeadTrainingDto.withStops;
    training.topRopes = updateLeadTrainingDto.topRopes;
    await this.leadTrainingRepository.update({ id }, training);
    return training;
  }

  async removeAll(): Promise<void> {
    await this.leadTrainingRepository.delete({});
  }

  async remove(id: number): Promise<void> {
    await this.leadTrainingRepository.delete(id);
  }
}
