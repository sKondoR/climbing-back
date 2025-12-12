import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthyEntity } from './entities/healthy.entity';
import { HealthyController } from './healthy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HealthyEntity])],
  controllers: [HealthyController],
  providers: [],
  exports: [],
})
export class HealthyModule {}
