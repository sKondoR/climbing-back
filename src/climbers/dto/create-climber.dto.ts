import { IRoute } from '../climbers.interfaces';
export class CreateClimberDto {
  id: number;
  allClimbId: number | null;
  name: string | null;
  routes: IRoute[] | null;
  updatedAt: string | null;
}
