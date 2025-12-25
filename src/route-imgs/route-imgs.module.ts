import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RouteImgEntity } from './entities/route-img.entity';
import { RouteImgsService } from './route-imgs.service';
import { RouteImgsController } from './route-imgs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RouteImgEntity])],
  controllers: [RouteImgsController],
  providers: [RouteImgsService],
  exports: [RouteImgsService],
})
export class RouteImgsModule {}
