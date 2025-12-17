import { IsInt, IsString } from 'class-validator';

export class AuthEntity {
  @IsInt()
  vk_id: number;

  @IsString()
  password: string;
}
