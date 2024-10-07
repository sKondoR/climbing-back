import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMemberEntity } from './entities/team-member.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMemberEntity)
    private teamMembersRepository: Repository<TeamMemberEntity>,
  ) {}

  async create(
    createTeamMemberDto: CreateTeamMemberDto,
  ): Promise<TeamMemberEntity> {
    const teamMember = new TeamMemberEntity();
    teamMember.id = createTeamMemberDto.id;
    teamMember.isCoach = createTeamMemberDto.isCoach;
    teamMember.name = createTeamMemberDto.name;
    teamMember.allClimbId = createTeamMemberDto.allClimbId;
    teamMember.year = createTeamMemberDto.year;
    teamMember.text = createTeamMemberDto.text;
    teamMember.isCityTeam = createTeamMemberDto.isCityTeam;
    return await this.teamMembersRepository.save(teamMember);
  }

  async findAll(): Promise<TeamMemberEntity[]> {
    return await this.teamMembersRepository.find();
  }

  async findOne(id: number): Promise<TeamMemberEntity> {
    return await this.teamMembersRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<TeamMemberEntity> {
    return await this.teamMembersRepository.findOne({ where: { name } });
  }

  async update(
    id: number,
    updateTeamDto: UpdateTeamMemberDto,
  ): Promise<TeamMemberEntity> {
    const teamMember = await this.teamMembersRepository.findOne({
      where: { id },
    });
    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }
    teamMember.isCoach = updateTeamDto.isCoach;
    teamMember.name = updateTeamDto.name;
    teamMember.allClimbId = updateTeamDto.allClimbId;
    teamMember.year = updateTeamDto.year;
    teamMember.text = updateTeamDto.text;
    teamMember.isCityTeam = updateTeamDto.isCityTeam;
    await this.teamMembersRepository.update({ id }, teamMember);
    return teamMember;
  }

  async removeAll(): Promise<void> {
    await this.teamMembersRepository.delete({});
  }

  async remove(id: number): Promise<void> {
    await this.teamMembersRepository.delete(id);
  }
}
