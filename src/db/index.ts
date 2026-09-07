import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Reuse the pool across development module reloads instead of leaking connections.
const globalForDb = globalThis as typeof globalThis & {
  databaseClient?: ReturnType<typeof postgres>;
};
const client = process.env.DATABASE_URL
  ? (globalForDb.databaseClient ??= postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    }))
  : null;

export const db = client ? drizzle(client) : null;
