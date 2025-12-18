import * as dotenv from 'dotenv';
// мигрировать в локальную базу
dotenv.config({ path: '.env.dev' });
// мигрировать в прод базу
// dotenv.config({ path: '.env' });
import { DataSource } from 'typeorm';
import { TeamMemberEntity } from '../team/entities/team-member.entity';
import { TEAM } from './data/team';

// npx ts-node src/migrate/migrate-team.ts 

interface Env {
    type: string;
    host: string;
    port: number;
    url: string;
    database: string;
    username: string;
    password: string;
    entities: [TeamMemberEntity],
    synchronize: boolean,
}

async function migrate(): Promise<void> {
  const dataSource  = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT) | 5432,
    url: process.env.POSTGRES_URL,
    database: process.env.POSTGRES_DB_NAME,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    entities: [TeamMemberEntity],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('База инициализированна');

    const teamRepository = dataSource.getRepository(TeamMemberEntity);
    // Очистка репозитория перед миграцией
    await teamRepository.clear();
    console.log('База очищенна');
    for (const team of TEAM) {
        const newTeam = teamRepository.create(team);
        await teamRepository.save(newTeam);
        console.log(`скалолаз "${team.name}" мигрирован в базу`);
    }
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy(); // Properly close connection
  }
}

migrate();