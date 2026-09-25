import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
if (process.env.ALLOW_DB_MIGRATION !== "true")
  throw new Error(
    "Migration is disabled. Verify the target development database, then set ALLOW_DB_MIGRATION=true.",
  );
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
  max: 1,
  connectionTimeoutMillis: 10000,
});
try {
  await migrate(drizzle(pool), {
    migrationsFolder: "./drizzle",
    migrationsSchema: "astrowed_migrations",
  });
  console.log("Application migration applied. Existing schemas unchanged.");
} catch {
  console.error("Migration failed. Check connectivity and migration files.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
