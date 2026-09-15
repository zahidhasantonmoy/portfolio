-- ┌─────────────────────────────────────────────────────────────────┐
-- │   Blog + Journal + Newsletter — PostgreSQL Database Schema      │
-- │   Run this in: Neon Console → SQL Editor                        │
-- └─────────────────────────────────────────────────────────────────┘

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. CATEGORIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL,
  name_bn     TEXT,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. TAGS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en  TEXT UNIQUE NOT NULL,
  name_bn  TEXT,
  slug     TEXT UNIQUE NOT NULL
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. POSTS (Blog + Journal — type দিয়ে আলাদা)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type        TEXT NOT NULL DEFAULT 'blog'
                     CHECK (post_type IN ('blog', 'journal')),
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'published', 'scheduled')),

  -- Bilingual content (same-row approach — simpler for personal blog)
  title_en         TEXT NOT NULL,
  title_bn         TEXT,
  slug             TEXT UNIQUE NOT NULL,

  excerpt_en       TEXT,
  excerpt_bn       TEXT,

  content_en       TEXT,    -- Markdown
  content_bn       TEXT,    -- Markdown

  -- SEO fields
  seo_title_en     TEXT,
  seo_title_bn     TEXT,
  meta_desc_en     TEXT,
  meta_desc_bn     TEXT,

  -- Media
  cover_image_url  TEXT,

  -- Relations
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Timestamps
  published_at     TIMESTAMPTZ,   -- NULL=draft, future date=scheduled
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),

  -- Extras
  read_time_min    INTEGER DEFAULT 3,
  is_featured      BOOLEAN DEFAULT false
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. POST_TAGS (Many-to-many)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS post_tags (
  post_id  UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id   UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. SUBSCRIBERS (Newsletter)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS subscribers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT UNIQUE NOT NULL,
  name             TEXT,
  status           TEXT DEFAULT 'active'
                     CHECK (status IN ('active', 'unsubscribed')),
  confirm_token    TEXT,
  confirmed_at     TIMESTAMPTZ,
  subscribed_at    TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at  TIMESTAMPTZ
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. DEVELOPMENT_LOGS (Daily Journal)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE TABLE IF NOT EXISTS development_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  title       TEXT NOT NULL,
  mood        TEXT DEFAULT 'productive'
                CHECK (mood IN ('productive', 'stuck', 'learning', 'breakthrough')),
  content_en  TEXT,
  content_bn  TEXT,
  tech_stack  TEXT[],            -- e.g., ARRAY['Laravel', 'PHP', 'PostgreSQL']
  resources   JSONB,             -- [{"title":"...", "url":"..."}]
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 7. INDEXES (performance)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE INDEX IF NOT EXISTS idx_posts_status        ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_type          ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_published_at  ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug          ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category      ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_dev_logs_date       ON development_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_email   ON subscribers(email);



-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 9. AUTO-UPDATE updated_at
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 10. SEED DATA (optional — delete if not needed)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSERT INTO categories (name_en, name_bn, slug, color) VALUES
  ('Laravel & PHP', 'Laravel ও PHP', 'laravel-php', '#f05340'),
  ('React & JavaScript', 'React ও JavaScript', 'react-js', '#61dafb'),
  ('PostgreSQL & Database', 'ডেটাবেজ', 'postgresql-database', '#336791'),
  ('Dev Tools & Workflow', 'ডেভেলপার টুলস', 'dev-tools', '#6366f1'),
  ('Learning Journal', 'শেখার ডায়েরি', 'learning-journal', '#10b981')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name_en, name_bn, slug) VALUES
  ('Laravel', 'Laravel', 'laravel'),
  ('PHP', 'PHP', 'php'),
  ('React', 'React', 'react'),
  ('Next.js', 'Next.js', 'nextjs'),
  ('PostgreSQL', 'PostgreSQL', 'postgresql'),
  ('JavaScript', 'JavaScript', 'javascript'),
  ('TypeScript', 'TypeScript', 'typescript'),
  ('Supabase', 'Supabase', 'supabase'),
  ('Tutorial', 'টিউটোরিয়াল', 'tutorial'),
  ('Beginner', 'শিক্ষার্থী', 'beginner')
ON CONFLICT (slug) DO NOTHING;
