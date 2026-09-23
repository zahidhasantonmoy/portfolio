export type CaseStudyCategory =
  | "web-app"
  | "ai-tool"
  | "automation"
  | "iot"
  | "research-project";

export interface LocalizedContent {
  title: string;
  problem: string;
  solution: string;
  technical_highlights: string;
  challenge: string;
  result: string;
  article: string; // Full markdown combining all sections
}

export interface CaseStudySEO {
  meta_description_en: string;
  seo_title_en: string;
  meta_description_bn: string;
  seo_title_bn: string;
  primary_keyword_en: string;
  primary_keyword_bn: string;
  search_intent: "portfolio" | "technical-case-study";
}

export interface CaseStudyThumbnail {
  src: string;
  alt_en: string;
  alt_bn: string;
  prompt?: string;
  aspect_ratio: "16:9" | "4:3" | "1:1";
}

export interface CaseStudyGalleryItem {
  src: string;
  caption_en: string;
  caption_bn: string;
}

export interface CaseStudy {
  slug: string;
  canonical_url: string;
  language_alternate: {
    en: string;
    bn: string;
  };
  published_date: string;
  updated_date: string;
  status: "draft" | "published";
  category: CaseStudyCategory;
  tags: string[];
  project_name: string;
  tagline_en: string;
  tagline_bn: string;
  english: LocalizedContent;
  bangla: LocalizedContent;
  tech_stack: string[];
  project_links: {
    live_url?: string;
    github_url?: string;
  };
  seo: CaseStudySEO;
  thumbnail: CaseStudyThumbnail;
  gallery?: CaseStudyGalleryItem[];
  related_blog_slugs?: string[];
  links?: {
    github?: string;
    portfolio?: string;
  };
}
