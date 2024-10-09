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
    const team = new LeadTrainingEntity();
    team.userId = createLeadTrainingDto.userId;
    team.date = createLeadTrainingDto.date;
    team.routes = createLeadTrainingDto.routes;
    return await this.leadTrainingRepository.save(team);
  }

  async findAll(): Promise<LeadTrainingEntity[]> {
    return await this.leadTrainingRepository.find();
  }

  async findOne(id: number): Promise<LeadTrainingEntity> {
    return await this.leadTrainingRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateLeadTrainingDto: UpdateLeadTrainingDto,
  ): Promise<LeadTrainingEntity> {
    const team = await this.leadTrainingRepository.findOne({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException('lead training not found');
    }
    team.date = updateLeadTrainingDto.date;
    team.routes = updateLeadTrainingDto.routes;
    await this.leadTrainingRepository.update({ id }, team);
    return team;
  }

  async removeAll(): Promise<void> {
    await this.leadTrainingRepository.delete({});
  }

  async remove(id: number): Promise<void> {
    await this.leadTrainingRepository.delete(id);
  }
}
