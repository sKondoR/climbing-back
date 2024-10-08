import { IWeekDay } from '../schedule.interfaces';

export class CreateEventDto {
  weekDay: IWeekDay;
  fromTime: string;
  toTime: string;
  place: string | null;
  type: string | null;
}
