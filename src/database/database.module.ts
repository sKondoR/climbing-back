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
          host: configService.get('POSTGRES_HOST'),
          url: configService.get('POSTGRES_URL'),
          directUrl: configService.get('POSTGRES_URL_NON_POOLING'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          logging: true,
          synchronize: false, // Be cautious about using synchronize in production
          
          // Добавьте следующие параметры для борьбы с "замерзанием" на Vercel
          keepConnectionAlive: true,
          extra: {
            // Управление пулом соединений
            max: 1, // Vercel Serverless ограничивает количество соединений
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 20000,
            // Recycle connection after 5 uses
            maxUses: 5, 
          },
        };
      },
      // useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}


// Check connection with raw SQL client:
// psql "$POSTGRES_URL"
