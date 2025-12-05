import { IRoute } from '../climbers/climbers.interfaces';

export interface IClimberParse {
  name?: string | null;
  leades?: IRoute[] | null;
  boulders?: IRoute[] | null;
  routesCount?: number | null;
}
