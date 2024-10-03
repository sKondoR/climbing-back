import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClimberDto } from './dto/create-climber.dto';
import { UpdateClimberDto } from './dto/update-climber.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Climber } from './entities/climber.entity';
import { Repository } from 'typeorm';
import { getNow } from './climbers.utils';
@Injectable()
export class ClimbersService {
  constructor(
    @InjectRepository(Climber) private climbersRepository: Repository<Climber>,
  ) {}

  async create(createClimberDto: CreateClimberDto): Promise<Climber> {
    const climber = new Climber();
    climber.id = createClimberDto.id;
    climber.name = createClimberDto.name;
    climber.allClimbId = createClimberDto.allClimbId;
    climber.leads = createClimberDto.leads;
    climber.boulders = createClimberDto.boulders;
    climber.updatedAt = getNow();
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
