import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { CreateClimberDto } from './dto/create-climber.dto';
import { UpdateClimberDto } from './dto/update-climber.dto';
import { ClimbersService } from './climbers.service';

@Controller('climbers')
export class ClimbersController {
  constructor(private readonly climbersService: ClimbersService) {}

  @Post()
  create(@Body() createClimberDto: CreateClimberDto) {
    return this.climbersService.create(createClimberDto);
  }

  @Get()
  findAll() {
    return this.climbersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.climbersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClimberDto: UpdateClimberDto) {
    return this.climbersService.update(+id, updateClimberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.climbersService.remove(+id);
  }
}
