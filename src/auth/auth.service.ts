import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { AuthEntity, AuthVKEntity } from './entities/auth.entities';
import { JwtPayloadInterface } from './auth.interfaces';

@Injectable()
export class AuthService {
  // usersService: any;
  constructor(
    private usersService: UsersService,
    // private readonly jwtService: JwtService,
    private http: HttpService,
  ) {}

  async validateUser(payload: JwtPayloadInterface): Promise<UserEntity | null> {
    return await this.usersService.findById(payload.id);
  }

  async authenticate(
    auth: AuthEntity,
    skipPasswordCheck: boolean = false,
  ): Promise<UpdateUserDto> {
    const user = await this.usersService.findByAllClimbId(auth.allClimbId);

    if (!user) {
      throw new BadRequestException();
    }

    const isRightPassword =
      user.password && !skipPasswordCheck
        ? await this.usersService.compareHash(auth.password, user.password)
        : true;

    if (!isRightPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    return {
      ...user,
      token: 'test',
      // token: await this.jwtService.sign({ id: user.id }),
    };
  }

  async getVkToken(auth: AuthVKEntity): Promise<any> {
    const redirect_url = `${process.env.APP_HOST}signin`;

    const queryParamsString =
      `https://id.vk.com/oauth2/auth?grant_type=authorization_code` +
      `&redirect_uri=${redirect_url}` +
      `&code_verifier=${auth.code_verifier}` +
      `&code=${auth.code}` +
      `&client_id=${process.env.VK_APP_CLIENT_ID}&device_id=${auth.device_id}&state=${auth.state}`;

    // const bodyFormData = new FormData();
    // bodyFormData.append('code', auth.code);
    const bodyFormData = new URLSearchParams({
      code: auth.code,
    });

    return this.http
      .post(queryParamsString, bodyFormData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .toPromise();
  }

  async getUserDataFromVk(userId: string, token: string): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${token}&v=5.120`,
      ),
    );
  }
}
