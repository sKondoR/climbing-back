import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { IRoute } from '../climbers.interfaces';

@Entity() // Declares the class as an entity
export class ClimberEntity {
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
  leads: IRoute[];

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
  })
  boulders: IRoute[];

  @Column()
  updatedAt: string;
}
