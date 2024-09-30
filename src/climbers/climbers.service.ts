import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClimberDto } from './dto/create-climber.dto';
import { UpdateClimberDto } from './dto/update-climber.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Climber } from './entities/climber.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClimbersService {
  constructor(
    @InjectRepository(Climber) private climbersRepository: Repository<Climber>,
  ) {}

  async create(createClimberDto: CreateClimberDto): Promise<Climber> {
    const climber = new Climber();
    climber.id = createClimberDto.id;
    climber.allClimbId = createClimberDto.allClimbId;
    climber.routes = createClimberDto.routes;
    climber.updatedAt = createClimberDto.updatedAt;
    console.log('HERE!', climber, createClimberDto);
    return await this.climbersRepository.save(climber);
  }

  async findAll(): Promise<Climber[]> {
    return await this.climbersRepository.find();
  }

  async findOne(id: number): Promise<Climber> {
    return await this.climbersRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateClimberDto: UpdateClimberDto,
  ): Promise<Climber> {
    const user = await this.climbersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Climber not found');
    }
    await this.climbersRepository.update({ id }, updateClimberDto);
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.climbersRepository.delete(id);
  }
}
