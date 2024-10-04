import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateClimberDto } from './dto/create-climber.dto';
import { UpdateClimberDto } from './dto/update-climber.dto';
import { ClimberEntity } from './entities/climber.entity';
import { getNow } from './climbers.utils';
@Injectable()
export class ClimbersService {
  constructor(
    @InjectRepository(ClimberEntity)
    private climbersRepository: Repository<ClimberEntity>,
  ) {}

  async create(createClimberDto: CreateClimberDto): Promise<ClimberEntity> {
    const climber = new ClimberEntity();
    climber.id = createClimberDto.id;
    climber.name = createClimberDto.name;
    climber.allClimbId = createClimberDto.allClimbId;
    climber.leads = createClimberDto.leads;
    climber.boulders = createClimberDto.boulders;
    climber.updatedAt = getNow();
    return await this.climbersRepository.save(climber);
  }

  async findAll(): Promise<ClimberEntity[]> {
    return await this.climbersRepository.find();
  }

  async findOne(id: number): Promise<ClimberEntity> {
    return await this.climbersRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateClimberDto: UpdateClimberDto,
  ): Promise<ClimberEntity> {
    console.log('HERE!', id);
    const user = await this.climbersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Climber not found');
    }
    user.name = updateClimberDto.name;
    user.allClimbId = updateClimberDto.allClimbId;
    user.leads = updateClimberDto.leads;
    user.boulders = updateClimberDto.boulders;
    user.updatedAt = getNow();
    await this.climbersRepository.update({ id }, user);
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.climbersRepository.delete(id);
  }
}
