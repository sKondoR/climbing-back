export interface IUser {
  id: number;
  allClimbId: number | null;
  name: string | null;
  team: IAllClimber[] | null;
  friends: IAllClimber[] | null;
}

export interface IAllClimber {
  allClimbId: number | null;
  name: string | null;
}
