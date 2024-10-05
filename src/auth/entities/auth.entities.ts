import { IsInt, IsString } from 'class-validator';

export class AuthEntity {
  @IsInt()
  allClimbId: number;

  @IsString()
  password: string;
}

export class AuthVKEntity {
  code: string;
}
