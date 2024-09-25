import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RouteItems } from './routes.interfaces';

@Controller('climbers')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getClimberById(@Query('id') id?: string): Promise<RouteItems> {
    const data = await this.appService.getClimberById(id);
    return data;
  }
}
