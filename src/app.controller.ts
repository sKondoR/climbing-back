import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
export const maxDuration = 30; // This function can run for a maximum of 5 seconds
@Controller('climbers')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getClimberById(@Query('id') id?: string): Promise<Array<string>> {
    const data = await this.appService.getClimberById(id);
    return data;
  }
}
