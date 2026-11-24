import HomePageContent from "./home-page-content";
import { sql } from "@/lib/db";

export const revalidate = 60; // Cache for 60 seconds

export default async function Home() {
  const [projects, skills, postCountRows] = await Promise.all([
    sql`SELECT * FROM projects ORDER BY display_order ASC, created_at DESC`.catch(() => undefined),
    sql`SELECT * FROM skills ORDER BY display_order ASC, created_at DESC`.catch(() => undefined),
    sql`SELECT COUNT(*)::int AS count FROM posts WHERE (status = 'published' OR (status = 'scheduled' AND published_at <= NOW())) AND post_type = 'blog' AND published_at <= NOW()`.catch(() => undefined),
  ]);

  const rawCount =
    postCountRows && postCountRows.length > 0
      ? Number((postCountRows[0] as { count?: unknown }).count)
      : NaN;
  const postCount = Number.isFinite(rawCount) ? rawCount : undefined;

  return <HomePageContent dbProjects={projects} dbSkills={skills} postCount={postCount} />;
}
