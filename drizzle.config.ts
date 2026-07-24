import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` reads only the schema (no DB connection needed); the
// url is used by `migrate`/`push`. Prefer the DIRECT (non-pooler) URL for those.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://localhost:5432/postgres",
  },
});
