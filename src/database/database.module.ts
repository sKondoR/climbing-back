import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get('NODE_ENV') !== 'dev';
        console.log('env:', configService);
        console.log('connect to DB: ', {
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT') | 5432,
          url: configService.get('POSTGRES_URL'),
          database: configService.get('POSTGRES_DB_NAME'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
        });
        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST'),
          port: configService.get('POSTGRES_PORT') | 5432,
          url: configService.get('POSTGRES_URL'),
          database: configService.get('POSTGRES_DB_NAME'),
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: false, // Be cautious about using synchronize in production
          logging: true,
          ssl: isProd ? {
            rejectUnauthorized: false // Required for Neon, Supabase, etc.
          } : false,
          
          // Добавьте следующие параметры для борьбы с "замерзанием" на Vercel
          keepConnectionAlive: true,
          extra: {
            max: 1, // Ограничение соединений из-за ограничений Vercel Serverless
            idleTimeoutMillis: 30000, // Время ожидания бездействия перед закрытием соединения
            connectionTimeoutMillis: 20000, // Таймаут подключения к базе данных
            // maxUses: 1, // Максимальное количество использований одного соединения перед пересозданием
          }
        };
      },
      // useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

