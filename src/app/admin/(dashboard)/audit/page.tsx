import { sql } from "@/lib/db";
import AuditClient, { PostAuditItem, ProjectAuditItem } from "./AuditClient";

export const revalidate = 0; // Dynamic route

export default async function AuditPage() {
  const [postsRes, projectsRes] = await Promise.all([
    sql`
      SELECT id, title_en, title_bn, slug, excerpt_en, content_en, content_bn, cover_image_url, published_at, updated_at, post_type, status
      FROM posts
      ORDER BY created_at DESC
    `.catch(() => []),
    sql`
      SELECT id, title, description, live_url, github_url, image_url, tech_stack, created_at
      FROM projects
      ORDER BY created_at DESC
    `.catch(() => []),
  ]);

  const posts: PostAuditItem[] = postsRes.map((p: any) => ({
    id: p.id,
    title_en: p.title_en || "",
    title_bn: p.title_bn || "",
    slug: p.slug || "",
    excerpt_en: p.excerpt_en || "",
    content_en: p.content_en || "",
    content_bn: p.content_bn || "",
    cover_image_url: p.cover_image_url || "",
    published_at: p.published_at ? new Date(p.published_at).toISOString() : null,
    updated_at: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
    post_type: p.post_type || "blog",
    status: p.status || "draft",
  }));

  const projects: ProjectAuditItem[] = projectsRes.map((prj: any) => ({
    id: prj.id,
    title: prj.title || "",
    description: prj.description || "",
    live_url: prj.live_url || "",
    github_url: prj.github_url || "",
    image_url: prj.image_url || "",
    tech_stack: prj.tech_stack || "",
    created_at: prj.created_at ? new Date(prj.created_at).toISOString() : new Date().toISOString(),
  }));

  return <AuditClient initialPosts={posts} initialProjects={projects} />;
}
