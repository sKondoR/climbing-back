import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  // BadRequestException,
  UnprocessableEntityException,
  HttpException,
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
  async vk(@Body(new ValidationPipe()) auth: AuthVKEntity) {
    let authData;

    try {
      authData = await this.authService.getVkToken(auth);
    } catch (err) {
      throw new UnprocessableEntityException('VK tokens error: ' + err);
    }

    const hasIdToken = authData.hasOwnProperty('id_token');

    if (!hasIdToken) {
      throw new HttpException(`No VK id_token: `, authData);
    }

    // const _user = await this.userService.findByVkId(authData.data.user_id);

    // if (_user) {
    //   return this.authService.authenticate(_user, true);
    // }

    try {
      const { data } = await this.authService.getUserDataFromVk(
        authData.user_id,
        authData.access_token,
      );

      const profile = data.response[0];

      const user = {
        vk_id: authData.user_id,
        allClimbId: authData.allClimbId,
        password: null,
        name: `${profile.first_name} ${profile.last_name}`,
        avatar_url: profile.photo_400,
        grant: IGrant.USER,
      };

      throw new HttpException(`VK user data: `, data);

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
