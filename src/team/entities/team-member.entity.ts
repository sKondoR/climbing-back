import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // Declares the class as an entity
export class TeamMemberEntity {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column({
    nullable: true,
    unique: true,
  })
  allClimbId: number;

  @Column({
    nullable: true,
    unique: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  year: string;

  @Column({
    nullable: true,
  })
  isCoach: boolean;

  @Column({
    nullable: true,
  })
  isCityTeam: boolean;

  @Column({
    nullable: true,
  })
  text: string;
}
