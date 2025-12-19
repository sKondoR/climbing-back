import { TeamMemberEntity } from '../team/entities/team-member.entity';
import { TEAM } from './data/team';
import migrate from './migrate';

// выполнить миграцию команды не забыв выбрать .env или .env.dev в migrate.ts
// npx ts-node src/migrate/migrate-team.ts 

migrate({
  entity: TeamMemberEntity,
  doMigration: async (repo) => {
    for (const climber of TEAM) {
      const newClimber = repo.create(climber);
      await repo.save(newClimber);
      console.log(`мигрирован "${newClimber.name}"`);
    }
  },
});