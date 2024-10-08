import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { IWeekDay } from '../schedule.interfaces';

@Entity() // Declares the class as an entity
export class ScheduleEventEntity {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column()
  weekDay: IWeekDay;

  @Column()
  fromTime: string;

  @Column()
  toTime: string;

  @Column({
    nullable: true,
  })
  place: string;

  @Column({
    nullable: true,
  })
  type: string;
}
