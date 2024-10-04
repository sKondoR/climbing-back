import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
// import { ConfigService, InjectConfig } from '@nestjs/config';
import { TEAM, FRIENDS } from './users.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './users.interfaces';

@Injectable()
export class UsersService {
  private saltRounds: number;

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    // @InjectConfig() private readonly config: ConfigService,
  ) {
    // this.saltRounds = config.get('app.salt_rounds', 10);
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const climber = new UserEntity();
    climber.password = createUserDto.password
      ? await this.getHash(createUserDto.password)
      : null;
    climber.name = createUserDto.name;
    climber.allClimbId = createUserDto.allClimbId;
    return await this.usersRepository.save(climber);
  }

  async findAll(): Promise<IUser[]> {
    return await this.usersRepository.find();
  }

  // hardcoded first user
  async findById(id: number): Promise<IUser> {
    return {
      id,
      allClimbId: 35292,
      grant: 0,
      password: null,
      vk_id: null,
      avatar_url: null,
      name: 'Виктор Кондрашин',
      team: TEAM,
      friends: FRIENDS,
      pro: [],
    };
  }

  async findByAllClimbId(allClimbId: number): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({ where: { allClimbId } });
  }

  async findByVkId(vk_id: number): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({ where: { vk_id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
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

  async getHash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async compareHash(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
