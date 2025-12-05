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
    origin: [
      'https://localhost',
      'https://climbing-web.vercel.app',
      'https://climbing-web.vercel.app/',
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

    // const options = {
    //   origin: '*',
    //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    //   preflightContinue: false,
    //   optionsSuccessStatus: 204,
    //   credentials: true,
    // };
    // app.enableCors(options);

  await app.listen(3000);
}
bootstrap();
