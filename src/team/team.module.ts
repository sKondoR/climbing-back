import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeamMemberEntity } from './entities/team-member.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamAllController } from './team-all.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMemberEntity])],
  controllers: [TeamController, TeamAllController],
  providers: [TeamService],
})
export class TeamModule {}
