import { IEvent } from 'src/schedule/schedule.interfaces';
import { ScheduleEventEntity } from '../schedule/entities/schedule-event.entity';
import { SCHEDULE } from './data/schedule';
import migrate from './migrate';

// выполнить миграцию команды не забыв выбрать .env или .env.dev в migrate.ts
// npx ts-node src/migrate/migrate-schedule.ts 

migrate({
  entity: ScheduleEventEntity,
  doMigration: async (repo) => {
    for (const event of SCHEDULE) {
      const newEvent = repo.create(event);
      await repo.save(newEvent);
    }
    console.log(`расписание мигрированно`);
  },
});
