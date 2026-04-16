import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Padrão singleton para evitar múltiplos pools durante o hot-reload do Next.js
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle>
}

function createDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
  return drizzle(pool, { schema })
}

if (!globalForDb.db) {
  globalForDb.db = createDb()
}

export const db = globalForDb.db
