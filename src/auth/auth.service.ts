import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { AuthEntity } from './entities/auth.entities';
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

  async getVkUser(code: string): Promise<any> {
    // const VKDATA = {
    //   client_id: process.env.CLIENT_ID,
    //   client_secret: process.env.CLIENT_SECRET,
    // };

    // const host =
    //   process.env.NODE_ENV === 'prod'
    //     ? process.env.APP_HOST
    //     : process.env.APP_LOCAL;

    const params = new URLSearchParams('https://id.vk.com/oauth2/public_info');
    params.append('client_id', process.env.CLIENT_ID);
    params.append('id_token', code);

    return firstValueFrom(
      this.http.get(
        `https://id.vk.com/oauth2/public_info`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        // `https://oauth.vk.com/access_token?client_id=52404639&client_secret=8d023nLvevMyDESBQOOu&redirect_uri=https://climbing-web.vercel.app/signin&code=c9b9570308376863ac`
        //`https://oauth.vk.com/access_token?client_id=${VKDATA.client_id}&client_secret=${VKDATA.client_secret}&redirect_uri=${host}/signin&code=${code}`,
        // {
        //   headers: {
        //     'Access-Control-Allow-Origin': 'http://localhost:3000',
        //     'Access-Control-Allow-Methods':
        //       'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        //     'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
        //     'Access-Control-Allow-Credentials': true,
        //   },
        // },
      ),
    );
  }

  async getUserDataFromVk(userId: string, token: string): Promise<any> {
    return firstValueFrom(
      this.http.get(
        `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_400,has_mobile,home_town,contacts,mobile_phone&access_token=${token}&v=5.120`,
      ),
    );
  }
}
