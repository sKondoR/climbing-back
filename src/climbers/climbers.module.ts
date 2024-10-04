import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClimberEntity } from './entities/climbers.entities';
import { ClimbersService } from './climbers.service';
import { ClimbersController } from './climbers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClimberEntity])],
  controllers: [ClimbersController],
  providers: [ClimbersService],
})
export class ClimbersModule {}
