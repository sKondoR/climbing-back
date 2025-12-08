import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

async function bootstrap() {
  const isProd = process.env.NODE_ENV !== 'dev';

  let app;
  if(isProd) {
    app = await NestFactory.create(AppModule);
  } else {
    app = await NestFactory.create(AppModule, { httpsOptions: {
      cert: fs.readFileSync('localhost+2.pem'),
      key: fs.readFileSync('localhost+2-key.pem'),
    }});
  }

  const allowedOrigins = [
    isProd ? process.env.APP_HOST : process.env.APP_LOCAL,
    `${isProd ? process.env.APP_HOST : process.env.APP_LOCAL}/`
  ];

  const options = {
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
  app.enableCors(options);

  await app.listen(3000);
}
bootstrap();
