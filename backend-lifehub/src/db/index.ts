import { drizzle, NodePgDatabase  } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env';
import * as schema from './schema';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });


export type DbClient =
  | NodePgDatabase<typeof schema>
  | Parameters<Parameters<NodePgDatabase<typeof schema>['transaction']>[0]>[0];

export const checkDbConnection = async () => {
  await pool.query('SELECT 1');
  console.log('Database connected');
};

const shutdown = async () => {
  console.log('Shutting down database pool...');
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
