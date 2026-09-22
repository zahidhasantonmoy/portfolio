import HomePageContent from "./home-page-content";
import { sql } from "@/lib/db";

export const revalidate = 60; // Cache for 60 seconds

export default async function Home() {
  const [projects, skills] = await Promise.all([
    sql`SELECT * FROM projects ORDER BY display_order ASC, created_at DESC`.catch(() => undefined),
    sql`SELECT * FROM skills ORDER BY display_order ASC, created_at DESC`.catch(() => undefined),
  ]);

  return <HomePageContent dbProjects={projects} dbSkills={skills} />;
}