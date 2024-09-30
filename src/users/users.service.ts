import { Injectable } from '@nestjs/common';
import { CLIMBER_IDS } from './users.constants';
import { IUser } from './users.interfaces';

@Injectable()
export class UsersService {
  async findAll(): Promise<number[]> {
    return CLIMBER_IDS;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findOne(id: number): Promise<IUser> {
    return {
      id,
      climberIds: CLIMBER_IDS,
    };
  }
}
