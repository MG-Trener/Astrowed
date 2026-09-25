import "dotenv/config";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/data/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["astrowed"],
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? "" },
});
