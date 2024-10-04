import * as path from 'path';

import { INestApplication, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'nestjs-config';

import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';

describe('AuthService', () => {
  let app: INestApplication;
  let module: TestingModule;
  let authService: AuthService;
  let payload: UpdateUserDto;
  let usersService: UsersService;
  let user: UserEntity;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.load(path.resolve(__dirname, '../', 'config', '*.ts')),
        TypeOrmModule.forRootAsync({
          useFactory: (config: ConfigService) => config.get('database'),
          inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  it('authenticate fail', async () => {
    let error;
    try {
      await authService.authenticate({
        allClimbId: 12345,
        password: 'df',
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(BadRequestException);
  });

  it('authenticate', async () => {
    user = await usersService.create({
      allClimbId: 12345,
      vk_id: null,
      avatar_url: null,
      password: 'testtest',
      name: 'test',
      grant: 1,
    });

    payload = await authService.authenticate({
      allClimbId: 12345,
      password: 'testtest',
    });

    expect(payload).toBeInstanceOf(UserEntity);
  });

  it('validateUser', async () => {
    const result = await authService.validateUser(user);
    expect(result).toBeInstanceOf(UserEntity);
  });

  afterAll(async () => {
    // await usersService.remove(user.id);
    app.close();
  });
});
