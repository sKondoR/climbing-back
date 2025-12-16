import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

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
  // toDo: allclimbId 201 critical size
  // @Column({ type: 'text', default: () => "'[]'" })
  // leads: string;
  // get data(): any {
  //   return JSON.parse(decompressFromUTF16(this.leads));
  // }
  // set data(value: any) {
  //   if (JSON.stringify(value).length > 1000000) {
  //     throw new Error('Data too large');
  //   }
  //   this.leads = compressToUTF16(JSON.stringify(value));
  // }

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
  })
  boulders: IRoute[];

  @Column({ type: 'int', default: 0 })
  routesCount: number;

  @Column({ type: 'int', default: 0 })
  scores: number;

  @Column()
  updatedAt: string;
}
