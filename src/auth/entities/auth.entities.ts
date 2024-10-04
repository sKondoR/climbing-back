import { IsEmail, IsString } from 'class-validator';

export class AuthEntity {
  @IsEmail()
  allClimbId: number;

  @IsString()
  password: string;
}

export class AuthVKEntity {
  code: string;
}
