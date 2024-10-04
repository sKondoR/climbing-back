export enum IGrant {
  ADMIN = 0,
  USER = 1,
}
export interface IUser {
  id: number;
  allClimbId: number | null;
  grant: IGrant;
  password: string | null;
  vk_id: number | null;
  avatar_url: string | null;
  name: string | null;
  team: IAllClimber[] | null;
  friends: IAllClimber[] | null;
  pro: IAllClimber[] | null;
}

export interface IAllClimber {
  allClimbId: number | null;
  name: string | null;
}
