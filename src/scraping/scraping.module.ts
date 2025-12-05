import { Module } from '@nestjs/common';

import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { ClimbersModule } from 'src/climbers/climbers.module';

@Module({
  imports: [ClimbersModule],
  controllers: [ScrapingController],
  providers: [ScrapingService],
})
export class ScrapingModule {}
