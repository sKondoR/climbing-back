import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IAllClimber } from '../users.interfaces';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  id: number;
  team: IAllClimber[] | null;
  friends: IAllClimber[] | null;
  pro: IAllClimber[] | null;
  token: string;
}
