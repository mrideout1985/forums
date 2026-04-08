import { Client } from 'pg';

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'forum',
  user: 'forum',
  password: 'forum',
};

export async function truncateAll(): Promise<void> {
  const client = new Client(dbConfig);
  await client.connect();
  try {
    await client.query('TRUNCATE user_roles, users CASCADE');
    await client.query(`
      DELETE FROM forums
      WHERE id NOT IN (
        'a0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000003'
      )
    `);
  } finally {
    await client.end();
  }
}
