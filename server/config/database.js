module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'travel_plans'),
        username: env('DATABASE_USERNAME', 'travel_plans'),
        password: env('DATABASE_PASSWORD', '12345678A!'),
        ssl: env.bool('DATABASE_SSL', false),
      },
      options: {},
    },
  },
});
