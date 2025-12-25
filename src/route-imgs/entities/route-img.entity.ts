import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class RouteImgEntity {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({
    nullable: true,
  })
  url: string;

  @Column({
    nullable: true,
  })
  imgUrl: string;

  @Column('bytea', {
    nullable: true,
  })
  imageData: Buffer;

  @Column({
    nullable: true,
  })
  error: string;
}
