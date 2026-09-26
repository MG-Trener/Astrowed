import "dotenv/config";
import pg from "pg";
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
  connectionTimeoutMillis: 10000,
});
try {
  await client.connect();
  const result = await client.query(
    "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema,table_name",
  );
  console.log(JSON.stringify({ connected: true, tables: result.rows }));
} catch (error) {
  console.error(
    "Database inspection failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
