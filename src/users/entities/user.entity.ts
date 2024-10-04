import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IAllClimber, IGrant } from '../users.interfaces';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column()
  grant: IGrant;

  @Column()
  password: string;

  @Column()
  allClimbId: number;

  @Column()
  vk_id: number;

  @Column()
  name: string;

  @Column()
  avatar_url: string;

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
