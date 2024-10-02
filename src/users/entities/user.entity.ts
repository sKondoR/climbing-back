import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IAllClimber } from '../users.interfaces';

@Entity() // Declares the class as an entity
export class User {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column()
  allClimbId: number;

  @Column()
  name: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
  })
  team: IAllClimber[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
  })
  friends: IAllClimber[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
  })
  pro: IAllClimber[];
}
