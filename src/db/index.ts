import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
export const db = process.env.DATABASE_URL
  ? drizzle(postgres(process.env.DATABASE_URL, { prepare: false, max: 5 }))
  : null;
