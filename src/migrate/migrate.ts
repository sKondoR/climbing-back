import * as dotenv from 'dotenv';
// мигрировать в локальную базу
dotenv.config({ path: '.env.dev' });
// мигрировать в прод базу
// dotenv.config({ path: '.env' });
import { DataSource } from 'typeorm';

export default async function migrate({
  entity,
  doMigration,
}): Promise<void> {
  const dataSource  = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
    url: process.env.POSTGRES_URL, 
    entities: [entity],
    synchronize: true,  // Включена синхронизация (для development)
    logging: ['error', 'warn'],
  });

  try {
    await dataSource.initialize();
    console.log('База инициализированна');

    const repository = dataSource.getRepository(entity);
    // Очистка репозитория перед миграцией
    await repository.clear();
    console.log('repository очищен');
    await doMigration(repository);
  } catch (error) {
    console.error('Ошибка при миграции teamRepository:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy(); // Properly close connection
  }
}
