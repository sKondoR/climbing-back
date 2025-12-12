import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HealthyEntity {
  @PrimaryGeneratedColumn()
  id: number;
}