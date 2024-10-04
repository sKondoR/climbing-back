import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ['content-type', 'Access-Control-Allow-Origin'],
    origin: '*',
  });
  await app.listen(3000);
}
bootstrap();
