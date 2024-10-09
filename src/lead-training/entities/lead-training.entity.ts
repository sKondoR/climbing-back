import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // Declares the class as an entity
export class LeadTrainingEntity {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  id: number;

  @Column({})
  userId: number;

  @Column({})
  date: string;

  @Column({
    nullable: true,
  })
  routes: string[];
}
