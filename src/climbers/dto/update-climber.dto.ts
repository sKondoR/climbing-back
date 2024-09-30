import { PartialType } from '@nestjs/mapped-types';
import { CreateClimberDto } from './create-climber.dto';

export class UpdateClimberDto extends PartialType(CreateClimberDto) {}
