import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { AuthEntity } from './entities/auth.entities';
import { JwtPayloadInterface, AuthVKEntity } from './auth.interfaces';

interface TokenResponse {
  [x: string]: any;
  access_token: string;
  id_token: string;
}
@Injectable()
export class AuthService {
  private readonly vkOauthUrl = 'https://id.vk.com/oauth2/auth';
  private readonly vkApiUrl = 'https://api.vk.com/method/users.get';
  private readonly redirectUri = `${process.env.NODE_ENV !== 'dev' ? process.env.APP_HOST : process.env.APP_LOCAL}/signin`;
  private readonly vkClientId = process.env.VK_APP_CLIENT_ID;

  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private http: HttpService,
  ) {}

  /**
   * Валидация пользователя по JWT payload
   */
  async validateUser(payload: JwtPayloadInterface): Promise<UserEntity | null> {
    return this.usersService.findById(payload.id);
  }

  /**
   * Аутентификация пользователя по allClimbId и паролю
   * @param auth - данные аутентификации
   * @param skipPasswordCheck - флаг пропуска проверки пароля (для внутренних вызовов)
   */
  async authenticate(
    auth: AuthEntity,
    skipPasswordCheck: boolean = false,
  ): Promise<UpdateUserDto> {
    const user = await this.usersService.findByVkId(auth.vk_id);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isRightPassword =
      user.password && !skipPasswordCheck
        ? await this.usersService.compareHash(auth.password, user.password)
        : true;

    if (!isRightPassword) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.id) {
      throw new BadRequestException('User ID is missing');
    }

    return {
      ...user,
      password: await this.jwtService.sign({ id: user.id }),
    };
  }

  /**
   * Получение ID-токена от VK через OAuth2
   * @param auth - данные OAuth от VK
   * @returns объект с id_token
   */
  async getVkToken(auth: AuthVKEntity): Promise<TokenResponse> {
    const queryParams = new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: this.redirectUri,
      code_verifier: auth.code_verifier,
      client_id: this.vkClientId,
      device_id: auth.device_id,
      state: auth.state,
    });

    try {
      const response = await firstValueFrom(
        this.http
          .post<TokenResponse>(
            `${this.vkOauthUrl}?${queryParams.toString()}`,
            new URLSearchParams({ code: auth.code }).toString(),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          )
          .pipe(
            catchError((error) => {
              throw new BadRequestException(
                'Failed to obtain token from VK: ' + (error.response?.data?.error_description || error.message),
              );
            }),
          ),
      );

      if (response?.data?.error_description) {
        throw new BadRequestException(response?.data?.error_description);
      }

      return { access_token: response.data.access_token, id_token: response.data.id_token };
    } catch (error) {
      // Ошибки уже обрабатываются в catchError, но на случай fallback
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Unexpected error during VK token exchange');
    }
  }

  /**
   * Получение данных пользователя из VK API
   * @param userId - ID пользователя VK
   * @param token - access token
   * @returns данные пользователя
   */
  async getUserDataFromVk(userId: string, token: string): Promise<any> {
    const params = new URLSearchParams({
      fields: 'photo_100,contacts',
      access_token: token,
      photo_sizes: '1',
      v: '5.245',
    });

    try {
      const response = await firstValueFrom(
        this.http.get(this.vkApiUrl, { params }).pipe(
          catchError((error) => {
            throw new BadRequestException(
              'Failed to fetch user data from VK: ' + (error.response?.data?.error?.error_msg || error.message),
            );
          }),
        ),
      );

      if (response?.data?.error) {
        throw new BadRequestException(
          'Failed to fetch user data from VK: ' + response?.data?.error?.error_msg
        );
      }
      return response || null;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Unexpected error during VK user data fetch');
    }
  }
}
