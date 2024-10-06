import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UnprocessableEntityException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthEntity, AuthVKEntity } from './entities/auth.entities';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { IGrant } from '../users/users.interfaces';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('/login/vk')
  async vk(
    @Body(new ValidationPipe()) auth: AuthVKEntity,
  ): Promise<UpdateUserDto> {
    let authData;

    try {
      authData = await this.authService.getVkToken(auth);
      // authData = await this.authService.getVkUser(auth.code);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new UnprocessableEntityException('Wrong VK code >>> ' + err);
    }

    return {
      vk_id: authData.user_id,
      allClimbId: authData.allClimbId,
      password: null,
      id: 1001,
      friends: [],
      team: [],
      pro: [],
      token: 'testtest',
    };

    const hasAllClimbId = authData.data.hasOwnProperty('allClimbId');

    const _user = hasAllClimbId
      ? await this.userService.findByAllClimbId(authData.data.allClimbId)
      : await this.userService.findByVkId(authData.data.user_id);

    if (_user) {
      return this.authService.authenticate(_user, true);
    }

    try {
      const { data } = await this.authService.getUserDataFromVk(
        authData.data.user_id,
        authData.data.access_token,
      );

      const profile = data.response[0];

      const user = {
        vk_id: authData.data.user_id,
        allClimbId: authData.data.allClimbId,
        password: null,
        name: `${profile.first_name} ${profile.last_name}`,
        avatar_url: profile.photo_400,
        grant: IGrant.USER,
      };

      await this.userService.create(user);

      return this.authService.authenticate(user, true);
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }

  @Post('/login')
  async login(
    @Body(new ValidationPipe()) auth: AuthEntity,
  ): Promise<UpdateUserDto> {
    return this.authService.authenticate(auth);
  }

  @Post('/register')
  async register(
    @Body(new ValidationPipe()) user: UserEntity,
  ): Promise<UpdateUserDto> {
    const emailExists = await this.userService.findByAllClimbId(
      user.allClimbId,
    );

    if (emailExists) {
      throw new UnprocessableEntityException('allClimbId already exists!');
    }

    await this.userService.create(user);

    return this.authService.authenticate(user);
  }
}
