import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class RouteImgEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column()
  url: string;

  @Column()
  imgUrl: string;

  @Column('bytea')
  imageData: Buffer;
}
