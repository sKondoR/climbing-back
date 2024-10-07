import { Controller, Get, Delete } from '@nestjs/common';

import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { TeamService } from './team.service';
import { TEAM } from '../migrate/team';

@Controller('team-all')
export class TeamFullController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  async create() {
    await this.teamService.removeAll();
    return TEAM.map(async (teamMember) => {
      const existed = await this.teamService.findByName(teamMember.name);
      if (existed) {
        return this.teamService.update(existed.id, {
          ...existed,
          ...teamMember,
        });
      }
      return this.teamService.create(teamMember as CreateTeamMemberDto);
    });
  }

  @Delete()
  async removeAll() {
    await this.teamService.removeAll();
    return { message: 'All team members removed.' };
  }
}
