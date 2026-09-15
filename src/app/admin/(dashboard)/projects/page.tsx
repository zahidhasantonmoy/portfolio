import { sql } from "@/lib/db";
import ProjectsClient from "./ProjectsClient";

export const revalidate = 0; // Dynamic route

export default async function ProjectsPage() {
  const projects = await sql`
    SELECT * FROM projects ORDER BY display_order ASC, created_at DESC
  `.catch(() => []);

  return <ProjectsClient initialProjects={projects as any} />;
}
