import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
const state = globalThis as unknown as { astrowedPool?: pg.Pool };
export function getDb() {
  if (!process.env.DATABASE_URL)
    throw new Error("База данных ещё не подключена.");
  state.astrowedPool ??= new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 20000,
  });
  return drizzle(state.astrowedPool, { schema });
}
