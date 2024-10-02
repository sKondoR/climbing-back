import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TEAM, FRIENDS } from './users.constants';
import { IUser } from './users.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const climber = new User();
    climber.id = createUserDto.id;
    climber.name = createUserDto.name;
    climber.allClimbId = createUserDto.allClimbId;
    climber.team = createUserDto.team;
    climber.friends = createUserDto.friends;
    climber.pro = createUserDto.pro;
    return await this.usersRepository.save(climber);
  }

  async findAll(): Promise<IUser[]> {
    return await this.usersRepository.find();
  }

  // hardcoded first user
  async findOne(id: number): Promise<IUser> {
    return {
      id,
      allClimbId: 35292,
      name: 'Виктор Кондрашин',
      team: TEAM,
      friends: FRIENDS,
      pro: [],
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.update({ id }, updateUserDto);
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
