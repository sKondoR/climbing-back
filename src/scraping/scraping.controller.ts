import { Controller, Get, Query } from '@nestjs/common';

import { ScrapingService } from './scraping.service';
import { IClimberParse, IErrorParse } from './scraping.interfaces';

@Controller('allClimb')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get()
  async getClimberById(@Query('id') id?: string): Promise<IClimberParse | IErrorParse> {
    const climber = await this.scrapingService.getClimberById(id);
    return climber;
  }
}
