import { sql } from "@/lib/db";
import SkillsClient from "./SkillsClient";

export const revalidate = 0; // Dynamic route

export default async function SkillsPage() {
  const skills = await sql`
    SELECT * FROM skills ORDER BY display_order ASC, created_at DESC
  `.catch(() => []);

  return <SkillsClient initialSkills={skills as any} />;
}
