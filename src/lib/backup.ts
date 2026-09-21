import { sql } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

export interface BackupData {
  categories?: any[];
  tags?: any[];
  posts?: any[];
  post_tags?: any[];
  development_logs?: any[];
  dev_logs?: any[];
  projects?: any[];
  skills?: any[];
  subscribers?: any[];
  contact_messages?: any[];
}

export interface BackupPayload {
  backup_version: string;
  author: string;
  domain: string;
  exported_at: string;
  stats: {
    total_posts: number;
    total_dev_logs: number;
    total_projects: number;
    total_skills: number;
    total_subscribers: number;
    total_messages: number;
    total_categories: number;
    total_tags: number;
    total_post_tags?: number;
  };
  data: BackupData;
}

export interface RestoreSummary {
  success: boolean;
  strategy: "skip_existing" | "overwrite";
  counts: {
    categories: { inserted: number; updated: number; skipped: number };
    tags: { inserted: number; updated: number; skipped: number };
    posts: { inserted: number; updated: number; skipped: number };
    post_tags: { inserted: number; skipped: number };
    development_logs: { inserted: number; updated: number; skipped: number };
    projects: { inserted: number; updated: number; skipped: number };
    skills: { inserted: number; updated: number; skipped: number };
    subscribers: { inserted: number; updated: number; skipped: number };
    contact_messages: { inserted: number; skipped: number };
  };
  errors: string[];
}

export function getCloudinaryClient() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
}

/**
 * Generates a full snapshot of the entire database.
 */
export async function generateBackupPayload(): Promise<BackupPayload> {
  const [
    posts,
    devLogs,
    projects,
    skills,
    subscribers,
    messages,
    categories,
    tags,
    postTags,
  ] = await Promise.all([
    sql`SELECT * FROM posts ORDER BY created_at DESC`.catch(() => []),
    sql`SELECT * FROM development_logs ORDER BY log_date DESC`.catch(() =>
      sql`SELECT * FROM dev_logs ORDER BY log_date DESC`.catch(() => [])
    ),
    sql`SELECT * FROM projects ORDER BY display_order ASC, created_at DESC`.catch(() => []),
    sql`SELECT * FROM skills ORDER BY display_order ASC, created_at DESC`.catch(() => []),
    sql`SELECT * FROM subscribers ORDER BY subscribed_at DESC`.catch(() => []),
    sql`SELECT * FROM contact_messages ORDER BY created_at DESC`.catch(() => []),
    sql`SELECT * FROM categories ORDER BY created_at DESC`.catch(() => []),
    sql`SELECT * FROM tags ORDER BY id ASC`.catch(() => []),
    sql`SELECT * FROM post_tags`.catch(() => []),
  ]);

  const now = new Date();

  return {
    backup_version: "1.0",
    author: "Zahid Hasan Tonmoy",
    domain: "https://zahidhasantonmoy.vercel.app",
    exported_at: now.toISOString(),
    stats: {
      total_posts: posts.length,
      total_dev_logs: devLogs.length,
      total_projects: projects.length,
      total_skills: skills.length,
      total_subscribers: subscribers.length,
      total_messages: messages.length,
      total_categories: categories.length,
      total_tags: tags.length,
      total_post_tags: postTags.length,
    },
    data: {
      categories,
      tags,
      posts,
      post_tags: postTags,
      development_logs: devLogs,
      projects,
      skills,
      subscribers,
      contact_messages: messages,
    },
  };
}

/**
 * Uploads a JSON backup snapshot string to Cloudinary in folder portfolio_backups/
 */
export async function uploadBackupToCloudinary(jsonString: string, filename?: string) {
  const cld = getCloudinaryClient();
  if (!cld) {
    throw new Error(
      "Cloudinary credentials missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  const dateTag = new Date().toISOString().replace(/[:.]/g, "-");
  const targetId = filename
    ? filename.replace(/\.json$/i, "")
    : `backup_${dateTag}`;

  return new Promise<{
    url: string;
    secure_url: string;
    public_id: string;
    bytes: number;
    created_at: string;
  }>((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "portfolio_backups",
        public_id: targetId,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        tags: ["database_backup", "portfolio", "neon_postgres"],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload backup to Cloudinary"));
        } else {
          resolve({
            url: result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            bytes: result.bytes,
            created_at: result.created_at,
          });
        }
      }
    );

    uploadStream.end(Buffer.from(jsonString, "utf-8"));
  });
}

/**
 * Lists available raw backups stored in Cloudinary folder portfolio_backups/
 */
export async function listCloudinaryBackups() {
  const cld = getCloudinaryClient();
  if (!cld) {
    return { configured: false, backups: [] };
  }

  try {
    const res = await cld.api.resources({
      resource_type: "raw",
      type: "upload",
      prefix: "portfolio_backups/",
      max_results: 30,
    });

    const backups = (res.resources || []).map((r: any) => {
      const cleanName = r.public_id.replace(/^portfolio_backups\//, "");
      return {
        public_id: r.public_id,
        name: cleanName.endsWith(".json") ? cleanName : `${cleanName}.json`,
        format: r.format || "json",
        bytes: r.bytes,
        created_at: r.created_at,
        url: r.url,
        secure_url: r.secure_url,
      };
    });

    // Sort newest first
    backups.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { configured: true, backups };
  } catch (err: any) {
    console.error("[Cloudinary listBackups] Error:", err);
    return { configured: true, error: err?.message || "Failed to list backups", backups: [] };
  }
}

/**
 * Restores a backup payload into the database.
 */
export async function restoreBackupPayload(
  payload: any,
  strategy: "skip_existing" | "overwrite" = "skip_existing"
): Promise<RestoreSummary> {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid backup data: not an object");
  }

  // Find data object
  const data: BackupData = payload.data || payload;
  const isOverwrite = strategy === "overwrite";

  const summary: RestoreSummary = {
    success: true,
    strategy,
    counts: {
      categories: { inserted: 0, updated: 0, skipped: 0 },
      tags: { inserted: 0, updated: 0, skipped: 0 },
      posts: { inserted: 0, updated: 0, skipped: 0 },
      post_tags: { inserted: 0, skipped: 0 },
      development_logs: { inserted: 0, updated: 0, skipped: 0 },
      projects: { inserted: 0, updated: 0, skipped: 0 },
      skills: { inserted: 0, updated: 0, skipped: 0 },
      subscribers: { inserted: 0, updated: 0, skipped: 0 },
      contact_messages: { inserted: 0, skipped: 0 },
    },
    errors: [],
  };

  // 1. Restore Categories
  if (Array.isArray(data.categories) && data.categories.length > 0) {
    for (const cat of data.categories) {
      if (!cat.slug || !cat.name_en) continue;
      try {
        const existing = await sql`SELECT id FROM categories WHERE slug = ${cat.slug} LIMIT 1`;
        if (existing.length > 0) {
          if (isOverwrite) {
            await sql`
              UPDATE categories SET
                name_en = ${cat.name_en},
                name_bn = ${cat.name_bn || null},
                description = ${cat.description || null},
                color = ${cat.color || "#6366f1"}
              WHERE slug = ${cat.slug}
            `;
            summary.counts.categories.updated++;
          } else {
            summary.counts.categories.skipped++;
          }
        } else {
          await sql`
            INSERT INTO categories (name_en, name_bn, slug, description, color, created_at)
            VALUES (${cat.name_en}, ${cat.name_bn || null}, ${cat.slug}, ${cat.description || null}, ${cat.color || "#6366f1"}, ${cat.created_at || new Date().toISOString()})
          `;
          summary.counts.categories.inserted++;
        }
      } catch (err: any) {
        summary.errors.push(`Category (${cat.slug}): ${err.message}`);
      }
    }
  }

  // 2. Restore Tags
  if (Array.isArray(data.tags) && data.tags.length > 0) {
    for (const tag of data.tags) {
      if (!tag.slug || !tag.name_en) continue;
      try {
        const existing = await sql`SELECT id FROM tags WHERE slug = ${tag.slug} OR name_en = ${tag.name_en} LIMIT 1`;
        if (existing.length > 0) {
          if (isOverwrite) {
            await sql`
              UPDATE tags SET
                name_en = ${tag.name_en},
                name_bn = ${tag.name_bn || null}
              WHERE slug = ${tag.slug}
            `;
            summary.counts.tags.updated++;
          } else {
            summary.counts.tags.skipped++;
          }
        } else {
          await sql`
            INSERT INTO tags (name_en, name_bn, slug)
            VALUES (${tag.name_en}, ${tag.name_bn || null}, ${tag.slug})
          `;
          summary.counts.tags.inserted++;
        }
      } catch (err: any) {
        summary.errors.push(`Tag (${tag.slug}): ${err.message}`);
      }
    }
  }

  // 3. Restore Posts
  if (Array.isArray(data.posts) && data.posts.length > 0) {
    for (const p of data.posts) {
      if (!p.slug || !p.title_en) continue;
      try {
        const existing = await sql`SELECT id FROM posts WHERE slug = ${p.slug} LIMIT 1`;
        if (existing.length > 0) {
          if (isOverwrite) {
            await sql`
              UPDATE posts SET
                post_type = ${p.post_type || "blog"},
                status = ${p.status || "draft"},
                title_en = ${p.title_en},
                title_bn = ${p.title_bn || null},
                excerpt_en = ${p.excerpt_en || null},
                excerpt_bn = ${p.excerpt_bn || null},
                content_en = ${p.content_en || null},
                content_bn = ${p.content_bn || null},
                seo_title_en = ${p.seo_title_en || null},
                seo_title_bn = ${p.seo_title_bn || null},
                meta_desc_en = ${p.meta_desc_en || null},
                meta_desc_bn = ${p.meta_desc_bn || null},
                cover_image_url = ${p.cover_image_url || null},
                category_id = ${p.category_id || null},
                published_at = ${p.published_at || null},
                updated_at = ${new Date().toISOString()},
                read_time_min = ${Number(p.read_time_min) || 3},
                is_featured = ${Boolean(p.is_featured)}
              WHERE slug = ${p.slug}
            `;
            summary.counts.posts.updated++;
          } else {
            summary.counts.posts.skipped++;
          }
        } else {
          await sql`
            INSERT INTO posts (
              post_type, status, title_en, title_bn, slug,
              excerpt_en, excerpt_bn, content_en, content_bn,
              seo_title_en, seo_title_bn, meta_desc_en, meta_desc_bn,
              cover_image_url, category_id, published_at, created_at, updated_at,
              read_time_min, is_featured, views, likes
            ) VALUES (
              ${p.post_type || "blog"}, ${p.status || "draft"}, ${p.title_en}, ${p.title_bn || null}, ${p.slug},
              ${p.excerpt_en || null}, ${p.excerpt_bn || null}, ${p.content_en || null}, ${p.content_bn || null},
              ${p.seo_title_en || null}, ${p.seo_title_bn || null}, ${p.meta_desc_en || null}, ${p.meta_desc_bn || null},
              ${p.cover_image_url || null}, ${p.category_id || null}, ${p.published_at || null},
              ${p.created_at || new Date().toISOString()}, ${p.updated_at || new Date().toISOString()},
              ${Number(p.read_time_min) || 3}, ${Boolean(p.is_featured)}, ${Number(p.views) || 0}, ${Number(p.likes) || 0}
            )
          `;
          summary.counts.posts.inserted++;
        }
      } catch (err: any) {
        summary.errors.push(`Post (${p.slug}): ${err.message}`);
      }
    }
  }

  // 4. Restore Post-Tags
  if (Array.isArray(data.post_tags) && data.post_tags.length > 0) {
    for (const pt of data.post_tags) {
      if (!pt.post_id || !pt.tag_id) continue;
      try {
        await sql`
          INSERT INTO post_tags (post_id, tag_id)
          VALUES (${pt.post_id}, ${pt.tag_id})
          ON CONFLICT DO NOTHING
        `;
        summary.counts.post_tags.inserted++;
      } catch {
        summary.counts.post_tags.skipped++;
      }
    }
  }

  // 5. Restore Development Logs
  const devLogsList = Array.isArray(data.development_logs)
    ? data.development_logs
    : Array.isArray(data.dev_logs)
    ? data.dev_logs
    : [];

  if (devLogsList.length > 0) {
    for (const log of devLogsList) {
      if (!log.title) continue;
      try {
        const existing = log.id ? await sql`SELECT id FROM development_logs WHERE id = ${log.id} LIMIT 1`.catch(() => []) : [];
        if (existing.length > 0) {
          if (isOverwrite) {
            await sql`
              UPDATE development_logs SET
                log_date = ${log.log_date || new Date().toISOString().split("T")[0]},
                title = ${log.title},
                mood = ${log.mood || "productive"},
                content_en = ${log.content_en || null},
                content_bn = ${log.content_bn || null},
                is_public = ${log.is_public !== undefined ? Boolean(log.is_public) : true}
              WHERE id = ${log.id}
            `;
            summary.counts.development_logs.updated++;
          } else {
            summary.counts.development_logs.skipped++;
          }
        } else {
          await sql`
            INSERT INTO development_logs (
              log_date, title, mood, content_en, content_bn, is_public, created_at
            ) VALUES (
              ${log.log_date || new Date().toISOString().split("T")[0]},
              ${log.title},
              ${log.mood || "productive"},
              ${log.content_en || null},
              ${log.content_bn || null},
              ${log.is_public !== undefined ? Boolean(log.is_public) : true},
              ${log.created_at || new Date().toISOString()}
            )
          `;
          summary.counts.development_logs.inserted++;
        }
      } catch (err: any) {
        summary.errors.push(`Dev Log (${log.title}): ${err.message}`);
      }
    }
  }

  // 6. Restore Projects
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    for (const prj of data.projects) {
      if (!prj.title) continue;
      try {
        const existing = prj.id ? await sql`SELECT id FROM projects WHERE id = ${prj.id} OR title = ${prj.title} LIMIT 1` : [];
        if (existing.length > 0) {
          if (isOverwrite) {
            await sql`
              UPDATE projects SET
                title = ${prj.title},
                description = ${prj.description || ""},
                github_url = ${prj.github_url || null},
                live_url = ${prj.live_url || null},
                image_url = ${prj.image_url || null},
                display_order = ${Number(prj.display_order) || 0},
                updated_at = ${new Date().toISOString()}
              WHERE id = ${existing[0].id}
            `;
            summary.counts.projects.updated++;
          } else {
            summary.counts.projects.skipped++;
          }
        } else {
          await sql`
            INSERT INTO projects (
              title, description, tech_stack, github_url, live_url, image_url, display_order, created_at, updated_at
            ) VALUES (
              ${prj.title},
              ${prj.description || ""},
              ${Array.isArray(prj.tech_stack) ? prj.tech_stack : ["React", "TypeScript"]},
              ${prj.github_url || null},
              ${prj.live_url || null},
              ${prj.image_url || null},
              ${Number(prj.display_order) || 0},
              ${prj.created_at || new Date().toISOString()},
              ${prj.updated_at || new Date().toISOString()}
            )
          `;
          summary.counts.projects.inserted++;
        }
      } catch (err: any) {
        summary.errors.push(`Project (${prj.title}): ${err.message}`);
      }
    }
  }

  // 7. Restore Skills
  if (Array.isArray(data.skills) && data.skills.length > 0) {
    for (const sk of data.skills) {
      if (!sk.name || !sk.category) continue;
      try {
        const existing = await sql`SELECT id FROM skills WHERE name = ${sk.name} AND category = ${sk.category} LIMIT 1`;
        if (existing.length > 0) {
          if (isOverwrite) {
            await sql`
              UPDATE skills SET
                icon = ${sk.icon || null},
                proficiency = ${Number(sk.proficiency) || 80},
                display_order = ${Number(sk.display_order) || 0}
              WHERE id = ${existing[0].id}
            `;
            summary.counts.skills.updated++;
          } else {
            summary.counts.skills.skipped++;
          }
        } else {
          await sql`
            INSERT INTO skills (category, name, icon, proficiency, display_order, created_at)
            VALUES (
              ${sk.category},
              ${sk.name},
              ${sk.icon || null},
              ${Number(sk.proficiency) || 80},
              ${Number(sk.display_order) || 0},
              ${sk.created_at || new Date().toISOString()}
            )
          `;
          summary.counts.skills.inserted++;
        }
      } catch (err: any) {
        summary.errors.push(`Skill (${sk.name}): ${err.message}`);
      }
    }
  }

  // 8. Restore Subscribers
  if (Array.isArray(data.subscribers) && data.subscribers.length > 0) {
    for (const sub of data.subscribers) {
      if (!sub.email) continue;
      try {
        const existing = await sql`SELECT id FROM subscribers WHERE email = ${sub.email} LIMIT 1`;
        if (existing.length > 0) {
          if (isOverwrite) {
            await sql`
              UPDATE subscribers SET
                name = ${sub.name || null},
                status = ${sub.status || "active"}
              WHERE email = ${sub.email}
            `;
            summary.counts.subscribers.updated++;
          } else {
            summary.counts.subscribers.skipped++;
          }
        } else {
          await sql`
            INSERT INTO subscribers (email, name, status, subscribed_at)
            VALUES (${sub.email}, ${sub.name || null}, ${sub.status || "active"}, ${sub.subscribed_at || new Date().toISOString()})
          `;
          summary.counts.subscribers.inserted++;
        }
      } catch (err: any) {
        summary.errors.push(`Subscriber (${sub.email}): ${err.message}`);
      }
    }
  }

  return summary;
}
