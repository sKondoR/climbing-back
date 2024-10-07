import { Controller, Post, Body, Delete } from '@nestjs/common';

import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { TeamService } from './team.service';

@Controller('team-all')
export class TeamFullController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Body() team: CreateTeamMemberDto[]) {
    return team.map(async (teamMember) => {
      const existed = await this.teamService.findByName(teamMember.name);
      if (existed) {
        return this.teamService.update(existed.id, {
          ...existed,
          ...teamMember,
        });
      }
      return this.teamService.create(teamMember);
    });
  }

  @Delete()
  async removeAll() {
    await this.teamService.removeAll();
    return { message: 'All team members removed.' };
  }
}
