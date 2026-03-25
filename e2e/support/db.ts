import { Client } from 'pg';

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'forum',
  user: 'forum',
  password: 'forum',
};

export async function truncateAll() {
  const client = new Client(dbConfig);
  await client.connect();
  await client.query('TRUNCATE user_roles, users CASCADE');
  await client.end();
}
