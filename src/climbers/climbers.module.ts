import { Module } from '@nestjs/common';
import { ClimbersService } from './climbers.service';
import { ClimbersController } from './climbers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Climber } from './entities/climber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Climber])],
  controllers: [ClimbersController],
  providers: [ClimbersService],
})
export class ClimbersModule {}
