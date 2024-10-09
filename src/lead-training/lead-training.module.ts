import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LeadTrainingEntity } from './entities/lead-training.entity';
import { LeadTrainingService } from './lead-training.service';
import { LeadTrainingController } from './lead-training.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeadTrainingEntity])],
  controllers: [LeadTrainingController],
  providers: [LeadTrainingService],
})
export class LeadTrainingModule {}
