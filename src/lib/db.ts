import { neon } from "@neondatabase/serverless";

/**
 * Neon serverless SQL client.
 * Usage: const rows = await sql`SELECT * FROM posts WHERE slug = ${slug}`;
 * Values are automatically parameterized — SQL injection safe.
 */
export const sql = neon(process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost/dummy");
