import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

async function bootstrap() {
  const isDev = process.env.NODE_ENV === 'dev';

  const httpsOptions = isDev ? {
    cert: fs.readFileSync('localhost+2.pem'),
    key: fs.readFileSync('localhost+2-key.pem'),
  } : {};

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors({
    origin: isDev ? 'https://localhost' : 'https://climbing-web.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
}
bootstrap();
