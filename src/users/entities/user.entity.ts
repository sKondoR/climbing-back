import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IClimberGroup, IGrant } from '../users.interfaces';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column({
    nullable: true,
    unique: true,
  })
  vk_id: number;

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
  groups: IClimberGroup[];
}
