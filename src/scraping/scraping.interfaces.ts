import { IRoute } from '../climbers/climbers.interfaces';

export interface IClimberParse {
  name: string | null;
  routes: IRoute[] | null;
}
