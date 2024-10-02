import { IAllClimber } from '../users.interfaces';
export class CreateUserDto {
  id: number;
  allClimbId: number;
  name: string | null;
  team: IAllClimber[] | null;
  friends: IAllClimber[] | null;
}
