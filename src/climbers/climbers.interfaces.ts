export interface IRoute {
  isBoulder: boolean;
  grade: string;
  name: string;
  date: string;
}
export type IRoutes = Array<IRoute>;

export interface IClimber {
  id: number;
  allClimbId: number;
  name: string | null;
  leads: IRoute[] | null;
  boulders: IRoute[] | null;
  updatedAt: string | null;
}
