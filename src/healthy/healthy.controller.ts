import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthyEntity } from './entities/healthy.entity'; // any simple entity (used only to test connection)

@Controller('healthy')
export class HealthyController {
  constructor(
    @InjectRepository(HealthyEntity)
    private appRepository: Repository<HealthyEntity>,
  ) {}

  @Get()
  async check() {
    try {
      // Run a lightweight query
      await this.appRepository.query('SELECT 1');
      return { status: 'ok', database: 'connected' };
    } catch (err) {
      return {
        status: 'error',
        database: 'disconnected',
        message: err.message,
      };
    }
  }
}