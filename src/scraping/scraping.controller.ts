import { Controller, Get, Query } from '@nestjs/common';

import { ScrapingService } from './scraping.service';
import { IClimberParse } from './scraping.interfaces';

@Controller('allClimb')
export class ScrapingController {
  constructor(private readonly appService: ScrapingService) {}

  @Get()
  async getClimberById(@Query('id') id?: string): Promise<IClimberParse> {
    const climber = await this.appService.getClimberById(id);
    return climber;
  }
}
