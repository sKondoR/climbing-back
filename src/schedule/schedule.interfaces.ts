export type IEventType = 'LEAD' | 'BOULDER' | 'SCHOOL' | 'HOBBY';

export type IWeekDay =
  | 'Понедельник'
  | 'Вторник'
  | 'Среда'
  | 'Четверг'
  | 'Пятница'
  | 'Суббота'
  | 'Воскресенье';

export interface IEvent {
  weekDay: IWeekDay;
  fromTime: string;
  toTime: string;
  place: string | null;
  type: string | null;
}
