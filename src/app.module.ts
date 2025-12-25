import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClimbersModule } from './climbers/climbers.module';
import { ScrapingModule } from './scraping/scraping.module';
import { DatabaseModule } from './database/database.module';
import { TeamModule } from './team/team.module';
import { ScheduleModule } from './schedule/schedule.module';
import { LeadTrainingModule } from './lead-training/lead-training.module';
import { HealthyModule } from './healthy/healthy.module';
import { RouteImgsModule } from './route-imgs/route-imgs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UsersModule,
    ClimbersModule,
    ScrapingModule,
    DatabaseModule,
    TeamModule,
    ScheduleModule,
    LeadTrainingModule,
    HealthyModule,
    RouteImgsModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
