export class CreateTeamMemberDto {
  id: number;
  isCoach: boolean | null;
  allClimbId: number | null;
  name: string | null;
  year: string | null;
  isCityTeam: boolean | null;
  text: string | null;
}
