import { IAllClimber } from '../users.interfaces';
export class CreateUserDto {
  vk_id: number | null;
  allClimbId: number | null;
  name: string | null;
  avatar_url: string | null;
  grant: number;
  password: string | null;

  team: IAllClimber[] | null;
  friends: IAllClimber[] | null;
  pro: IAllClimber[] | null;
}
