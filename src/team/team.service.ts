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

  async create(createTeamDto: CreateTeamMemberDto): Promise<TeamMemberEntity> {
    const teamMember = new TeamMemberEntity();
    teamMember.id = createTeamDto.id;
    teamMember.name = createTeamDto.name;
    teamMember.allClimbId = createTeamDto.allClimbId;
    teamMember.year = createTeamDto.year;
    teamMember.text = createTeamDto.text;
    teamMember.isCityTeam = createTeamDto.isCityTeam;
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
    teamMember.name = updateTeamDto.name;
    teamMember.allClimbId = updateTeamDto.allClimbId;
    teamMember.year = updateTeamDto.year;
    teamMember.text = updateTeamDto.text;
    teamMember.isCityTeam = updateTeamDto.isCityTeam;
    await this.teamMembersRepository.update({ id }, teamMember);
    return teamMember;
  }

  async remove(id: number): Promise<void> {
    await this.teamMembersRepository.delete(id);
  }
}
