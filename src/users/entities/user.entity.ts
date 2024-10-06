import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IAllClimber, IGrant } from '../users.interfaces';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column()
  grant: IGrant;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    nullable: true,
  })
  allClimbId: number;

  @Column({
    nullable: true,
    unique: true,
  })
  vk_id: number;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
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
