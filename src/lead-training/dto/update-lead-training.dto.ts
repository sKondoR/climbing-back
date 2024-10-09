import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadTrainingDto } from './create-lead-training.dto';

export class UpdateLeadTrainingDto extends PartialType(CreateLeadTrainingDto) {}
