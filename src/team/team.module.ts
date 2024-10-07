import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeamMemberEntity } from './entities/team-member.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamFullController } from './team-full.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMemberEntity])],
  controllers: [TeamController, TeamFullController],
  providers: [TeamService],
})
export class TeamModule {}
