import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;

/**
 * True when a database connection string is configured. Callers check this and
 * degrade gracefully (empty states) instead of throwing before the DB has been
 * provisioned — so `next build` and the site work with zero setup.
 */
export const isDbConfigured = Boolean(DATABASE_URL);

type Db = PostgresJsDatabase<typeof schema>;

// Cache the client on globalThis so Next's dev HMR doesn't open a fresh pool on
// every reload (same singleton idea used elsewhere for server resources).
const globalForDb = globalThis as unknown as {
  _sql?: ReturnType<typeof postgres>;
  _db?: Db;
};

export function getDb(): Db {
  if (!DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set — cannot reach the database. See SHOWCASE_SETUP.md.",
    );
  }
  if (!globalForDb._db) {
    // Supabase's transaction pooler does not support prepared statements.
    const sql = globalForDb._sql ?? postgres(DATABASE_URL, { prepare: false });
    globalForDb._sql = sql;
    globalForDb._db = drizzle(sql, { schema });
  }
  return globalForDb._db;
}
