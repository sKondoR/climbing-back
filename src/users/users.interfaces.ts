export enum IGrant {
  ADMIN = 0,
  USER = 1,
}
export interface IUser {
  id: number;
  vk_id: number | null;
  allClimbId: number | null;
  name: string | null;
  avatar_url: string | null;
  grant: IGrant;
  password: string | null;
  team: IAllClimber[] | null;
  friends: IAllClimber[] | null;
  pro: IAllClimber[] | null;
}

export interface IAllClimber {
  allClimbId: number | null;
  name: string | null;
}
