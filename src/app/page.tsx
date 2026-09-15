import HomePageContent from "./home-page-content";
import { sql } from "@/lib/db";

export const revalidate = 300; // Cache for 5 minutes

export default async function Home() {
  const [projects, skills] = await Promise.all([
    sql`SELECT * FROM projects ORDER BY display_order ASC, created_at DESC`.catch(() => null),
    sql`SELECT * FROM skills ORDER BY display_order ASC, created_at DESC`.catch(() => null),
  ]);

  return <HomePageContent dbProjects={projects} dbSkills={skills} />;
}