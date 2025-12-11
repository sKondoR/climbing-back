export interface IRoute {
  isBoulder: boolean;
  isTopRope: boolean;
  grade: string;
  name: string;
  date: string;
  region?: string;
  text: string;
}
export type IRoutes = Array<IRoute>;

export interface IClimber {
  id: number;
  allClimbId: number;
  name: string | null;
  leads: IRoute[] | null;
  boulders: IRoute[] | null;
  updatedAt: string | null;
  routesCount: number | null;
  scores: number | null;
}
