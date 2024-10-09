import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateLeadTrainingDto } from './dto/create-lead-training.dto';
import { UpdateLeadTrainingDto } from './dto/update-lead-training.dto';
import { LeadTrainingService } from './lead-training.service';

@Controller('lead-training')
export class LeadTrainingController {
  constructor(private readonly leadTrainingService: LeadTrainingService) {}

  @Post()
  create(@Body() createLeadTrainingDto: CreateLeadTrainingDto) {
    return this.leadTrainingService.create(createLeadTrainingDto);
  }

  @Get()
  findAll() {
    return this.leadTrainingService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: number) {
    return this.leadTrainingService.findAllByUser(+userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadTrainingDto: UpdateLeadTrainingDto,
  ) {
    return this.leadTrainingService.update(+id, updateLeadTrainingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadTrainingService.remove(+id);
  }
}
