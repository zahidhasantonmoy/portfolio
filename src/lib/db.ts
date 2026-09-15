import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Neon serverless SQL client.
 * Usage: const rows = await sql`SELECT * FROM posts WHERE slug = ${slug}`;
 * Values are automatically parameterized — SQL injection safe.
 */
export const sql = neon(process.env.DATABASE_URL);
