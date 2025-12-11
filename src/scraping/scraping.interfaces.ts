import { IRoute } from '../climbers/climbers.interfaces';

export interface IClimberParse {
  name: string;
  leads: IRoute[];
  boulders: IRoute[];
  routesCount: number;
  scores: number;
}

export interface IErrorParse {
  message: string;
}
