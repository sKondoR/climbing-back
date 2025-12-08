import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

async function bootstrap() {
  const isDev = process.env.NODE_ENV === 'dev';

  let app;
  if(isDev) {
    app = await NestFactory.create(AppModule, { httpsOptions: {
      cert: fs.readFileSync('localhost+2.pem'),
      key: fs.readFileSync('localhost+2-key.pem'),
    }});
  } else {
    app = await NestFactory.create(AppModule);
  }

  const allowedOrigins = [
    isDev ? process.env.APP_LOCAL : process.env.APP_HOST,
    `${isDev ? process.env.APP_LOCAL : process.env.APP_HOST}/`
  ];

  console.log('>>> ', process.env.APP_LOCAL, process.env.APP_HOST)
  const options = {
    origin: isDev ? 'https://localhost' : 'https://climbing-web.vercel.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
  app.enableCors(options);

  await app.listen(3000);
}
bootstrap();
