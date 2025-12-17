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
import { AuthEntity } from './entities/auth.entities';
import { AuthVKEntity } from './auth.interfaces';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { IGrant } from '../users/users.interfaces';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
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

    try {
      const { data } = await this.authService.getUserDataFromVk(
        authData.user_id,
        authData.access_token,
      );
      
      const vkUser = data.response[0];
      const existedUser = vkUser.id && await this.userService.findByVkId(vkUser.id);

      if (existedUser?.avatar_url) {
        return this.authService.authenticate(existedUser);
      }

      const newUser = {
        vk_id: vkUser.id,
        name: `${vkUser.first_name} ${vkUser.last_name}`,
        avatar_url: vkUser.photo_400,
        password: null,
        grant: IGrant.USER,
        groups: [],
      };

      // "id": 26807,
      // "has_mobile": 1,
      // "photo_400": "https://sun6-22.userapi.com/s/v1/ig2/dJRIlk67zM0sfXG4MJK8gRqO62HCeoaYfimmH0sNqyFKf5z3gEbR9fgwce0a0RnmFU7VMufOE3oJACblWXOxiYbT.jpg?quality=96&crop=63,21,677,677&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640&ava=1&cs=400x400",
      // "mobile_phone": "89052506681",
      // "home_phone": "",
      // "home_town": "",
      // "first_name": "Сергей",
      // "last_name": "Кондрашин",
      // "can_access_closed": true,
      // "is_closed": false

      await this.userService.create(newUser);
      return this.authService.authenticate(newUser);
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

  // @Post('/register')
  // async register(
  //   @Body(new ValidationPipe()) user: UserEntity,
  // ): Promise<UpdateUserDto> {
  //   const emailExists = await this.userService.findByAllClimbId(
  //     user.allClimbId,
  //   );

  //   if (emailExists) {
  //     throw new UnprocessableEntityException('allClimbId already exists!');
  //   }

  //   await this.userService.create(user);

  //   return this.authService.authenticate(user);
  // }
}
