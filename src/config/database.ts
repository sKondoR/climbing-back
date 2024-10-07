module.exports = {
  type: 'postgres',
  host: 'localhost', // host: process.env.DB_HOST,
  url: process.env.POSTGRES_URL,
  directUrl: process.env.POSTGRES_URL_NON_POOLING,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], //  [process.env.DB_ENTITIES],
  logging: true, // process.env.DB_LOGGING === 'true'
  synchronize: true, // Be cautious about using synchronize in production process.env.DB_SYNCRONIZE === 'true'
  // port: process.env.DB_PORT,
  // database: process.env.DB_DATABASE,
};
