import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: 'localhost',
          url: configService.get('POSTGRES_URL'),
          directUrl: configService.get('POSTGRES_URL_NON_POOLING'),
          // database: configService.get('POSTGRES_HOST'),
          // port: configService.get('POSTGRES_PORT'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          logging: true,
          // schema: sync,
          // synchronize: true, // Be cautious about using synchronize in production
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
