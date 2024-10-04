import { IRoute } from '../climbers.interfaces';

export class CreateClimberDto {
  id: number;
  allClimbId: number | null;
  name: string | null;
  leads: IRoute[] | null;
  boulders: IRoute[] | null;
}
