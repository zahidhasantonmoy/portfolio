// ─── Post ─────────────────────────────────────────────────────────────────────
export interface Post {
  id: string;
  post_type: "blog" | "journal";
  status: "draft" | "published" | "scheduled";

  title_en: string;
  title_bn?: string | null;
  slug: string;

  excerpt_en?: string | null;
  excerpt_bn?: string | null;

  content_en?: string | null;
  content_bn?: string | null;

  seo_title_en?: string | null;
  seo_title_bn?: string | null;
  meta_desc_en?: string | null;
  meta_desc_bn?: string | null;

  cover_image_url?: string | null;

  category_id?: string | null;
  categories?: Category | null;
  post_tags?: { tags: Tag }[];

  published_at?: string | null;
  created_at: string;
  updated_at: string;

  read_time_min: number;
  is_featured: boolean;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name_en: string;
  name_bn?: string | null;
  slug: string;
  description?: string | null;
  color: string;
  created_at: string;
}

// ─── Tag ──────────────────────────────────────────────────────────────────────
export interface Tag {
  id: string;
  name_en: string;
  name_bn?: string | null;
  slug: string;
}

// ─── DevLog ───────────────────────────────────────────────────────────────────
export type LogMood = "productive" | "stuck" | "learning" | "breakthrough";

export interface DevLog {
  id: string;
  log_date: string;        // ISO date string: "2026-09-15"
  title: string;
  mood: LogMood;
  content_en?: string | null;
  content_bn?: string | null;
  tech_stack?: string[] | null;
  resources?: { title: string; url: string }[] | null;
  is_public: boolean;
  created_at: string;
}

// ─── Subscriber ───────────────────────────────────────────────────────────────
export interface Subscriber {
  id: string;
  email: string;
  name?: string | null;
  status: "active" | "unsubscribed";
  confirmed_at?: string | null;
  subscribed_at: string;
}

// ─── Admin Post Form ──────────────────────────────────────────────────────────
export interface PostFormData {
  post_type: "blog" | "journal";
  status: "draft" | "published" | "scheduled";
  title_en: string;
  title_bn?: string;
  slug: string;
  excerpt_en?: string;
  excerpt_bn?: string;
  content_en?: string;
  content_bn?: string;
  seo_title_en?: string;
  seo_title_bn?: string;
  meta_desc_en?: string;
  meta_desc_bn?: string;
  cover_image_url?: string;
  category_id?: string;
  tag_ids?: string[];
  published_at?: string;
  is_featured?: boolean;
  read_time_min?: number;
}
