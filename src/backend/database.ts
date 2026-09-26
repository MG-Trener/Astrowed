import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../data/schema";
const state = globalThis as unknown as { accountPool?: pg.Pool };
export function pool() {
  if (!process.env.DATABASE_URL) throw new Error("Database not configured");
  if (!state.accountPool) {
    state.accountPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 20000,
    });
    state.accountPool.on("error", () =>
      console.error("Account database connection interrupted"),
    );
  }
  return state.accountPool;
}
export const accountDb = () => drizzle(pool(), { schema });
