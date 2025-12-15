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
          username: configService.get('POSTGRES_USER'),
          password: configService.get('POSTGRES_PASSWORD'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          logging: ['query', 'error', 'schema'],
          // logger: 'advanced-console',
          // synchronize: false, // Be cautious about using synchronize in production
          // extra: {
          //   max: 10, // Limit connections
          //   connectionTimeoutMillis: 100000,
          //   idleTimeoutMillis: 100000,
          //   ssl: false,
          // },  
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
