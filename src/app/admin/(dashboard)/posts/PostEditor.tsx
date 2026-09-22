"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { CldUploadWidget } from "next-cloudinary";
import type { Post, PostFormData, ContentImage } from "@/types/blog";
import SerpPreviewModal from "@/components/admin/SerpPreviewModal";

// Markdown editor — dynamically imported to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Category {
  id: string;
  name_en: string;
  slug: string;
}

interface Tag {
  id: string;
  name_en: string;
  slug: string;
}

interface PostEditorProps {
  post?: Partial<Post>;
  categories: Category[];
  tags: Tag[];
  selectedTagIds?: string[];
  mode: "create" | "edit";
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper to format Date for datetime-local input (YYYY-MM-DDTHH:mm)
function formatForDatetimeInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Compute dynamic human-friendly relative time message
function getRelativeTimeMessage(targetDateStr?: string | null): string {
  if (!targetDateStr) return "";
  const target = new Date(targetDateStr).getTime();
  if (isNaN(target)) return "";
  const diff = target - Date.now();
  if (diff <= 0) return "Ready to go live (time arrived)";

  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remHours = diffHours % 24;
    return `in ${diffDays} day${diffDays > 1 ? "s" : ""}${remHours > 0 ? ` ${remHours} hr${remHours > 1 ? "s" : ""}` : ""}`;
  }
  if (diffHours > 0) {
    const remMins = diffMinutes % 60;
    return `in ${diffHours} hr${diffHours > 1 ? "s" : ""}${remMins > 0 ? ` ${remMins} min${remMins > 1 ? "s" : ""}` : ""}`;
  }
  return `in ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
}

// Parse imported publish date strings (supports YYYY-MM-DD or ISO datetime)
function parsePublishDate(rawDateStr?: string): { isFuture: boolean; isoString?: string; formattedInput?: string } {
  if (!rawDateStr || typeof rawDateStr !== "string") return { isFuture: false };
  const trimmed = rawDateStr.trim();
  if (!trimmed) return { isFuture: false };

  let dt: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    // If only YYYY-MM-DD, set default publish time to 10:00:00 AM local time
    const [y, m, d] = trimmed.split("-").map(Number);
    dt = new Date(y, m - 1, d, 10, 0, 0);
  } else {
    dt = new Date(trimmed);
  }

  if (isNaN(dt.getTime())) return { isFuture: false };

  const isFuture = dt.getTime() > Date.now();
  const formattedInput = formatForDatetimeInput(dt);

  return {
    isFuture,
    isoString: dt.toISOString(),
    formattedInput,
  };
}

// Quick presets generator
function getSchedulePresets() {
  const now = new Date();

  const tomorrow10 = new Date(now);
  tomorrow10.setDate(tomorrow10.getDate() + 1);
  tomorrow10.setHours(10, 0, 0, 0);

  const tomorrowEvening = new Date(now);
  tomorrowEvening.setDate(tomorrowEvening.getDate() + 1);
  tomorrowEvening.setHours(19, 0, 0, 0);

  const in2Days10 = new Date(now);
  in2Days10.setDate(in2Days10.getDate() + 2);
  in2Days10.setHours(10, 0, 0, 0);

  const nextWeekend = new Date(now);
  const daysUntilSunday = (7 - nextWeekend.getDay()) % 7 || 7;
  nextWeekend.setDate(nextWeekend.getDate() + daysUntilSunday);
  nextWeekend.setHours(20, 0, 0, 0);

  const nextMonday9 = new Date(now);
  const daysUntilMonday = (8 - nextMonday9.getDay()) % 7 || 7;
  nextMonday9.setDate(nextMonday9.getDate() + daysUntilMonday);
  nextMonday9.setHours(9, 0, 0, 0);

  return [
    { label: "Tomorrow 10 AM", sub: "10:00 AM", dt: formatForDatetimeInput(tomorrow10), icon: "🌅" },
    { label: "Tomorrow 7 PM", sub: "07:00 PM", dt: formatForDatetimeInput(tomorrowEvening), icon: "🌆" },
    { label: "In 2 Days (10 AM)", sub: "+2 days", dt: formatForDatetimeInput(in2Days10), icon: "📅" },
    { label: "Next Sunday 8 PM", sub: "Prime Time", dt: formatForDatetimeInput(nextWeekend), icon: "🎉" },
    { label: "Next Monday 9 AM", sub: "Workweek Kickoff", dt: formatForDatetimeInput(nextMonday9), icon: "🗓️" },
  ];
}

// Quick hour adjuster
function adjustScheduleTime(hoursToAdd: number, baseDateStr?: string): string {
  const base = baseDateStr && !isNaN(new Date(baseDateStr).getTime())
    ? new Date(baseDateStr)
    : new Date();
  const start = base.getTime() < Date.now() ? new Date() : base;
  start.setTime(start.getTime() + hoursToAdd * 60 * 60 * 1000);
  return formatForDatetimeInput(start);
}

type TabType = "english" | "bangla" | "ai" | "social" | "json" | "settings";

export interface SocialData {
  linkedin_post?: string;
  linkedin_hashtags?: string[];
  linkedin_post_en?: string;
  linkedin_hashtags_en?: string[];
  linkedin_post_bn?: string;
  linkedin_hashtags_bn?: string[];
  devto_title?: string;
  devto_article?: string;
  devto_tags?: string[];
  twitter_post?: string;
}

export default function PostEditor({
  post,
  categories,
  tags,
  selectedTagIds = [],
  mode,
}: PostEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("english");
  const [saving, setSaving] = useState(false);
  const [generatingSEO, setGeneratingSEO] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [generatingMeta, setGeneratingMeta] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingImagePrompt, setGeneratingImagePrompt] = useState(false);
  const [autoOptimizingSEO, setAutoOptimizingSEO] = useState(false);
  const [showSerpPreview, setShowSerpPreview] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("Flux Pro (1280x720)");
  const [imageStyle, setImageStyle] = useState("auto");
  const [promptMeta, setPromptMeta] = useState<{
    theme?: string;
    color_palette?: string;
    concept?: string;
  } | null>(null);
  const [preferredProvider, setPreferredProvider] = useState("auto");
  
  const [completedTasks, setCompletedTasks] = useState({
    seo: false,
    translate: false,
    meta: false,
    image: false,
    post: false,
  });
  
  const [generatingPost, setGeneratingPost] = useState(false);
  const [postTopic, setPostTopic] = useState("");
  
  const [quotas, setQuotas] = useState<any[]>([]);
  const [loadingQuotas, setLoadingQuotas] = useState(false);

  // JSON Input Box state
  const [jsonInput, setJsonInput] = useState("");
  const [parsedJsonData, setParsedJsonData] = useState<any>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Social Media & Syndication state (Permanent & Persistent)
  const [socialData, setSocialData] = useState<SocialData | null>(null);
  const [generatingSocial, setGeneratingSocial] = useState(false);

  // Dedicated Content Images state (img-1, img-2 default slots)
  const defaultContentImages: ContentImage[] = useMemo(
    () => [
      {
        id: "img-1",
        placement_marker: "{{IMAGE:img-1}}",
        prompt: "",
        alt_en: "",
        alt_bn: "",
        caption_en: "",
        caption_bn: "",
        url: null,
        status: "pending",
      },
      {
        id: "img-2",
        placement_marker: "{{IMAGE:img-2}}",
        prompt: "",
        alt_en: "",
        alt_bn: "",
        caption_en: "",
        caption_bn: "",
        url: null,
        status: "pending",
      },
    ],
    []
  );

  const [contentImages, setContentImages] = useState<ContentImage[]>(defaultContentImages);
  const [generatingContentImageId, setGeneratingContentImageId] = useState<string | null>(null);
  const [generatingAllContentImages, setGeneratingAllContentImages] = useState(false);

  // Form state
  const [form, setForm] = useState({
    post_type: post?.post_type ?? "blog",
    status: post?.status ?? "draft",
    title_en: post?.title_en ?? "",
    title_bn: post?.title_bn ?? "",
    slug: post?.slug ?? "",
    excerpt_en: post?.excerpt_en ?? "",
    excerpt_bn: post?.excerpt_bn ?? "",
    content_en: post?.content_en ?? "",
    content_bn: post?.content_bn ?? "",
    seo_title_en: post?.seo_title_en ?? "",
    seo_title_bn: post?.seo_title_bn ?? "",
    meta_desc_en: post?.meta_desc_en ?? "",
    meta_desc_bn: post?.meta_desc_bn ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    category_id: post?.category_id ?? "",
    published_at: post?.published_at
      ? (typeof post.published_at === "string" ? post.published_at : new Date(post.published_at).toISOString()).slice(0, 16)
      : "",
    is_featured: post?.is_featured ?? false,
    tag_ids: selectedTagIds,
    read_time_min: post?.read_time_min ?? 3,
  });

  const [pingingIndex, setPingingIndex] = useState(false);
  const [showSeoDetails, setShowSeoDetails] = useState(false);

  // Cross-posting state
  const [crossPosting, setCrossPosting] = useState({ devto: false });
  const [crossPostResult, setCrossPostResult] = useState<{ devto: { url: string; status: string } | null }>({ devto: null });

  // Real-time SEO & GEO (Generative Engine Optimization) Score Calculation
  const seoScoreData = useMemo(() => {
    let score = 0;
    const checks: { label: string; passed: boolean; tip: string }[] = [];

    // 1. English Title Length (40-70 chars ideal for Google SERP)
    const titleLen = (form.title_en || "").trim().length;
    const titlePassed = titleLen >= 40 && titleLen <= 70;
    if (titlePassed) score += 15;
    else if (titleLen > 0) score += 8;
    checks.push({
      label: "English Title Length",
      passed: titlePassed,
      tip: `${titleLen} chars (Ideal: 40–70 characters for Google SERP display)`,
    });

    // 2. Meta Description Length (120-165 chars ideal)
    const metaDesc = (form.meta_desc_en || form.excerpt_en || "").trim();
    const metaLen = metaDesc.length;
    const metaPassed = metaLen >= 120 && metaLen <= 165;
    if (metaPassed) score += 20;
    else if (metaLen >= 50) score += 10;
    checks.push({
      label: "Meta Description Length",
      passed: metaPassed,
      tip: `${metaLen} chars (Ideal: 120–165 characters for search & AI snippets)`,
    });

    // 3. Dual-Language Bangla Localization Parity
    const hasBnTitle = (form.title_bn || "").trim().length > 5;
    const hasBnContent = (form.content_bn || "").trim().length > 30 || (form.excerpt_bn || "").trim().length > 20;
    const bnPassed = hasBnTitle && hasBnContent;
    if (bnPassed) score += 15;
    else if (hasBnTitle || hasBnContent) score += 8;
    checks.push({
      label: "Dual-Language (Bangla) Parity",
      passed: bnPassed,
      tip: bnPassed
        ? "Bangla title & content configured for regional search rank"
        : "Add Bangla title & content to capture Bangladeshi audience & regional SEO",
    });

    // 4. Generative Engine Optimization (GEO) Direct Answer Readiness
    const contentIntro = (form.content_en || "").slice(0, 400).toLowerCase();
    const hasDirectAnswer =
      contentIntro.length >= 80 &&
      (/\b(is a|is an|are|used to|provides|enables|helps to|guide on|tutorial covers|in this article|learn how to)\b/i.test(
        contentIntro
      ) ||
        contentIntro.split(" ").length >= 30);
    if (hasDirectAnswer) score += 20;
    else if ((form.content_en || "").length > 50) score += 10;
    checks.push({
      label: "GEO / AI Overview Direct Answer",
      passed: !!hasDirectAnswer,
      tip: hasDirectAnswer
        ? "Opening paragraph delivers direct answer for Perplexity & Google AI Overviews"
        : "Provide a clear direct definition/solution in the first 2-3 sentences for AI citations",
    });

    // 5. Content Depth & Heading Hierarchy
    const wordCount = (form.content_en || "").trim().split(/\s+/).filter(Boolean).length;
    const hasHeadings = /#{2,4}\s+/.test(form.content_en || "");
    const depthPassed = wordCount >= 300 && hasHeadings;
    if (depthPassed) score += 15;
    else if (wordCount >= 100) score += 8;
    checks.push({
      label: "Article Depth & Headings (H2/H3)",
      passed: depthPassed,
      tip: `${wordCount} words, ${hasHeadings ? "structured with Markdown headings" : "headings missing"} (Target: 300+ words with H2/H3)`,
    });

    // 6. Clean URL Slug
    const slugValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug || "");
    if (slugValid && (form.slug || "").length >= 3) score += 15;
    else if ((form.slug || "").length > 0) score += 7;
    checks.push({
      label: "Clean Search-Engine-Friendly Slug",
      passed: slugValid && (form.slug || "").length >= 3,
      tip: form.slug ? `/blog/${form.slug}` : "Provide a hyphenated, lowercase slug",
    });

    const finalScore = Math.min(100, Math.max(0, score));
    return {
      score: finalScore,
      checks,
      grade:
        finalScore >= 80
          ? "🚀 Top 1 Ranking & AI Ready"
          : finalScore >= 50
          ? "🟡 Good - Minor Optimizations Needed"
          : "🔴 Needs SEO & Content Work",
      badgeColor:
        finalScore >= 80
          ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/40"
          : finalScore >= 50
          ? "text-yellow-400 bg-yellow-950/60 border-yellow-500/40"
          : "text-rose-400 bg-rose-950/60 border-rose-500/40",
      progressColor:
        finalScore >= 80
          ? "bg-emerald-500"
          : finalScore >= 50
          ? "bg-yellow-500"
          : "bg-rose-500",
    };
  }, [form]);

  const handleTitleChange = useCallback((val: string) => {
    setForm((prev) => ({
      ...prev,
      title_en: val,
      slug: mode === "create" ? slugify(val) : prev.slug,
    }));
  }, [mode]);

  function toggleTag(tagId: string) {
    setForm((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter((id) => id !== tagId)
        : [...prev.tag_ids, tagId],
    }));
  }

  // LocalStorage persistence helpers for social data & content images
  const getStorageKey = useCallback(
    (type: "social" | "images") => {
      const idKey = post?.id || form.slug || "new_post";
      return `portfolio_post_${type}_${idKey}`;
    },
    [post?.id, form.slug]
  );

  const saveSocialToStorage = useCallback(
    (data: SocialData | null) => {
      if (typeof window === "undefined") return;
      try {
        if (data) {
          localStorage.setItem(getStorageKey("social"), JSON.stringify(data));
        }
      } catch (e) {
        console.warn("Failed to save social data to localStorage:", e);
      }
    },
    [getStorageKey]
  );

  const saveImagesToStorage = useCallback(
    (images: ContentImage[]) => {
      if (typeof window === "undefined") return;
      try {
        if (images && images.length > 0) {
          localStorage.setItem(getStorageKey("images"), JSON.stringify(images));
        }
      } catch (e) {
        console.warn("Failed to save content images to localStorage:", e);
      }
    },
    [getStorageKey]
  );

  // Restore saved social data and images from localStorage on load
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const keySocial = getStorageKey("social");
      const savedSocial = localStorage.getItem(keySocial);
      if (savedSocial) {
        const parsed = JSON.parse(savedSocial);
        if (parsed && typeof parsed === "object") {
          setSocialData((prev) => prev ?? parsed);
        }
      }

      const keyImages = getStorageKey("images");
      const savedImages = localStorage.getItem(keyImages);
      if (savedImages) {
        const parsed = JSON.parse(savedImages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContentImages((prev) => {
            const merged = [...parsed];
            if (!merged.some((i) => i.id === "img-1")) {
              merged.unshift(defaultContentImages[0]);
            }
            if (!merged.some((i) => i.id === "img-2")) {
              merged.splice(1, 0, defaultContentImages[1]);
            }
            return merged;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load draft assets from localStorage:", e);
    }
  }, [getStorageKey, defaultContentImages]);

  // Sync state changes to storage
  useEffect(() => {
    if (socialData) {
      saveSocialToStorage(socialData);
    }
  }, [socialData, saveSocialToStorage]);

  useEffect(() => {
    if (contentImages.length > 0) {
      saveImagesToStorage(contentImages);
    }
  }, [contentImages, saveImagesToStorage]);

  const handleUploadAndInsertImage = async (file: File, field: "content_en" | "content_bn") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files can be uploaded");
      return;
    }
    const toastId = toast.loading("Uploading image to Cloudinary...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^\w\s-]/g, "");
      const markdownImage = `\n\n![${cleanName}](${data.url})\n\n`;
      setForm((prev) => ({
        ...prev,
        [field]: prev[field] ? prev[field] + markdownImage : markdownImage,
      }));
      toast.success("Image uploaded and inserted into markdown! 🖼️", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image", { id: toastId });
    }
  };

  // Dedicated Cloudinary direct upload for content images
  const handleUploadContentImage = async (file: File, imgId: string) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    const toastId = toast.loading(`Uploading image for ${imgId} to Cloudinary...`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setContentImages((prev) => {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^\w\s-]/g, "");
        const updated = prev.map((item) =>
          item.id === imgId
            ? {
                ...item,
                url: data.url,
                status: "completed" as const,
                alt_en: item.alt_en || cleanName,
                alt_bn: item.alt_bn || form.title_bn || "পোস্টের ছবি",
              }
            : item
        );
        saveImagesToStorage(updated);
        return updated;
      });
      toast.success(`🎉 ${imgId} uploaded successfully!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image", { id: toastId });
    }
  };

  // Dedicated Cover Image direct upload
  const handleUploadCoverImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    const toastId = toast.loading("Uploading cover image to Cloudinary...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setForm((prev) => ({ ...prev, cover_image_url: data.url }));
      toast.success("🎉 Cover image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image", { id: toastId });
    }
  };

  // Smart image insertion into English or Bangla markdown
  const insertImageIntoContent = (
    img: {
      id: string;
      url?: string | null;
      alt_en?: string;
      alt_bn?: string;
      caption_en?: string;
      caption_bn?: string;
      placement_marker?: string;
    },
    lang: "en" | "bn"
  ) => {
    if (!img.url) {
      toast.error(`Please upload or generate ${img.id} first before inserting.`);
      return;
    }

    const field = lang === "en" ? "content_en" : "content_bn";
    const currentContent = form[field] || "";
    const marker = img.placement_marker || `{{IMAGE:${img.id}}}`;
    const alt =
      (lang === "en" ? img.alt_en : img.alt_bn) ||
      (lang === "en" ? form.title_en : form.title_bn) ||
      img.id;
    const caption = lang === "en" ? img.caption_en : img.caption_bn;
    const md = `\n\n![${alt}](${img.url}${caption ? ` "${caption}"` : ""})\n\n`;

    // Case 1: The marker {{IMAGE:img-N}} exists in the text -> replace it
    if (currentContent.includes(marker)) {
      const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const updated = currentContent.replace(new RegExp(escapedMarker, "g"), md);
      setForm((prev) => ({ ...prev, [field]: updated }));
      toast.success(`✨ Replaced marker ${marker} in ${lang === "en" ? "English" : "বাংলা"} article!`);
      return;
    }

    // Case 2: If image is already in content by URL, inform user
    if (currentContent.includes(img.url)) {
      toast(`Visual ${img.id} is already in the ${lang === "en" ? "English" : "বাংলা"} article!`, { icon: "ℹ️" });
      return;
    }

    // Case 3: Marker NOT found -> smartly insert after a relevant section or append cleanly
    const headerRegex = /^##\s+.+$/gm;
    const matches = Array.from(currentContent.matchAll(headerRegex));

    let insertPos = -1;
    if (img.id === "img-1" && matches.length >= 1) {
      const match = matches[0];
      const nextBreak = currentContent.indexOf("\n\n", (match.index || 0) + match[0].length);
      insertPos = nextBreak !== -1 ? nextBreak : (match.index || 0) + match[0].length;
    } else if (img.id === "img-2" && matches.length >= 2) {
      const match = matches[1];
      const nextBreak = currentContent.indexOf("\n\n", (match.index || 0) + match[0].length);
      insertPos = nextBreak !== -1 ? nextBreak : (match.index || 0) + match[0].length;
    }

    if (insertPos !== -1) {
      const updated = currentContent.slice(0, insertPos) + md + currentContent.slice(insertPos);
      setForm((prev) => ({ ...prev, [field]: updated }));
      toast.success(`✨ Inserted ${img.id} after section in ${lang === "en" ? "English" : "বাংলা"} article!`);
    } else {
      const updated = currentContent.trim() ? `${currentContent.trim()}${md}` : md.trim();
      setForm((prev) => ({ ...prev, [field]: updated }));
      toast.success(`✨ Added ${img.id} to ${lang === "en" ? "English" : "বাংলা"} article!`);
    }
  };

  // Smart cover image insertion at top of article
  const insertCoverIntoContent = (lang: "en" | "bn") => {
    if (!form.cover_image_url) {
      toast.error("Please upload or generate a cover image first.");
      return;
    }
    const field = lang === "en" ? "content_en" : "content_bn";
    const current = form[field] || "";
    const alt = (lang === "en" ? form.title_en : form.title_bn) || "Cover Image";
    const md = `![${alt}](${form.cover_image_url})\n\n`;

    if (current.includes(form.cover_image_url)) {
      toast("Cover image is already inside this article!", { icon: "ℹ️" });
      return;
    }

    setForm((prev) => ({ ...prev, [field]: md + current }));
    toast.success(`✨ Inserted cover image at top of ${lang === "en" ? "English" : "বাংলা"} article!`);
  };

  // 1-Click AI Social Posts Generator
  const handleGenerateSocial = async () => {
    if (!form.title_en.trim() || !form.content_en.trim()) {
      toast.error("Please enter English Title and Content first to generate social posts.");
      return;
    }

    setGeneratingSocial(true);
    const toastId = toast.loading("🤖 Generating high-engagement social posts with AI...");

    try {
      const selectedTags = tags.filter((t) => form.tag_ids.includes(t.id)).map((t) => t.name_en);
      const res = await fetch("/api/admin/generate-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title_en,
          content: form.content_en,
          slug: form.slug,
          tags: selectedTags,
          provider: preferredProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate social posts");

      let linkedinBn = socialData?.linkedin_post_bn || "";
      if (!linkedinBn && (form.title_bn || form.content_bn)) {
        linkedinBn = `🚀 ${form.title_bn || form.title_en}\n\n${form.excerpt_bn || "আমাদের নতুন ব্লগে বিস্তারিত পড়ুন।"}\n\n🔗 সম্পূর্ণ আর্টিকেলটি পড়ুন: https://zahidhasantonmoy.vercel.app/bn/blog/${form.slug || ""}\n\n#বাংলা #প্রোগ্রামিং #ওয়েবডেভেলপমেন্ট #TechBangladesh`;
      }

      const newSocial: SocialData = {
        linkedin_post_en: data.linkedin?.post || "",
        linkedin_hashtags_en: Array.isArray(data.linkedin?.hashtags) ? data.linkedin.hashtags : [],
        linkedin_post_bn: linkedinBn,
        linkedin_hashtags_bn: socialData?.linkedin_hashtags_bn?.length ? socialData.linkedin_hashtags_bn : ["#বাংলা", "#প্রোগ্রামিং", "#ওয়েবডেভেলপমেন্ট", "#TechBangladesh"],
        devto_title: data.devto?.title || form.title_en,
        devto_article: data.devto?.article || form.content_en,
        devto_tags: Array.isArray(data.devto?.tags) ? data.devto.tags : [],
        twitter_post: data.twitter?.tweet || (Array.isArray(data.twitter?.thread) ? data.twitter.thread.join("\n\n") : ""),
      };

      setSocialData(newSocial);
      saveSocialToStorage(newSocial);
      toast.success("🎉 Viral social media posts generated successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to generate social posts", { id: toastId });
    } finally {
      setGeneratingSocial(false);
    }
  };

  async function handleSave(newStatus?: "draft" | "published" | "scheduled", dateOverride?: string) {
    setSaving(true);

    if (!form.title_en.trim()) {
      toast.error("English title is required.");
      setSaving(false);
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required.");
      setSaving(false);
      return;
    }

    const finalStatus = newStatus ?? form.status;
    const finalDate = dateOverride || form.published_at;

    if (finalStatus === "scheduled") {
      if (!finalDate) {
        toast.error("Please pick a future publish date & time to schedule.");
        setSaving(false);
        return;
      }
      if (new Date(finalDate).getTime() <= Date.now()) {
        toast.error("Scheduled date must be in the future.");
        setSaving(false);
        return;
      }
    }

    const payload = {
      ...form,
      status: finalStatus,
      published_at: (finalStatus === "published" && !finalDate)
        ? new Date().toISOString()
        : finalDate
          ? new Date(finalDate).toISOString()
          : null,
      category_id: form.category_id || null,
    };

    try {
      const url = mode === "edit" && post?.id
        ? `/api/admin/posts/${post.id}`
        : "/api/admin/posts";
      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      if (finalStatus === "scheduled") {
        toast.success(`Post scheduled for ${new Date(finalDate!).toLocaleDateString([], { month: "short", day: "numeric" })} at ${new Date(finalDate!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}! ⏰`);
      } else {
        toast.success("Saved successfully!");
      }

      if (mode === "create" && data?.post?.id) {
        // Transfer draft localStorage keys to the newly created post ID
        try {
          if (socialData) {
            localStorage.setItem(`portfolio_post_social_${data.post.id}`, JSON.stringify(socialData));
          }
          if (contentImages && contentImages.length > 0) {
            localStorage.setItem(`portfolio_post_images_${data.post.id}`, JSON.stringify(contentImages));
          }
        } catch {}
        router.push(`/admin/posts/${data.post.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleScheduleSubmit(selectedDatetime: string) {
    if (!selectedDatetime) {
      toast.error("Please select a date and time");
      return;
    }
    const targetTime = new Date(selectedDatetime).getTime();
    if (targetTime <= Date.now()) {
      toast.error("Scheduled date must be in the future");
      return;
    }
    setForm((prev) => ({ ...prev, status: "scheduled", published_at: selectedDatetime }));
    setShowScheduleModal(false);
    await handleSave("scheduled", selectedDatetime);
  }

  async function handleUnschedule() {
    setForm((prev) => ({ ...prev, status: "draft", published_at: "" }));
    setScheduleDate("");
    setShowScheduleModal(false);
    toast.success("Schedule cancelled. Post reverted to draft.");
    await handleSave("draft", "");
  }


  async function handleDelete() {
    if (!post?.id || !confirm("Delete this post permanently?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Post deleted");
      router.push("/admin/posts");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting post");
    }
  }

  async function handlePingIndexing() {
    setPingingIndex(true);
    const loadingToast = toast.loading("🚀 Pinging Google & Bing to crawl and index...");
    try {
      const res = await fetch("/api/admin/index-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: form.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to notify search engines");

      toast.success("✅ Google & Bing notified! Sitemap and URL submitted for instant indexing.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to ping search engines");
    } finally {
      toast.dismiss(loadingToast);
      setPingingIndex(false);
    }
  }

  async function handleGenerateSEO() {
    if (!form.title_en.trim() || !form.content_en.trim()) {
      toast.error("Please enter English Title and Content first to generate SEO.");
      return;
    }
    setGeneratingSEO(true);
    try {
      const res = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title_en, content: form.content_en, provider: preferredProvider }),
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response from SEO API:", text);
        throw new Error(`Server returned an unexpected response (Status: ${res.status}). See console for details.`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate SEO");

      setForm((prev) => ({
        ...prev,
        seo_title_en: data.seo_title_en || prev.seo_title_en,
        meta_desc_en: data.meta_desc_en || prev.meta_desc_en,
        seo_title_bn: data.seo_title_bn || prev.seo_title_bn,
        meta_desc_bn: data.meta_desc_bn || prev.meta_desc_bn,
      }));
      setCompletedTasks(prev => ({ ...prev, seo: true }));
      toast.success("✨ SEO metadata auto-generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate SEO");
    } finally {
      setGeneratingSEO(false);
      fetchQuotas();
    }
  }

  async function handleGeneratePost() {
    setGeneratingPost(true);
    const loadingToast = toast.loading("✍️ Generating complete dual-language blog post with Gemini... This can take up to 60 seconds.");
    
    try {
      const res = await fetch("/api/admin/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: postTopic, provider: preferredProvider }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate post");

      const jsonString = JSON.stringify(data, null, 2);
      setJsonInput(jsonString);
      applyJsonToForm(jsonString);

      setCompletedTasks((prev) => ({
        ...prev,
        post: true,
        translate: true,
        seo: true,
        meta: true,
      }));

      toast.success("✨ Complete dual-language blog post, SEO & social content auto-filled!");
      setActiveTab("english");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate post");
    } finally {
      toast.dismiss(loadingToast);
      setGeneratingPost(false);
      fetchQuotas();
    }
  }

  async function handleGenerateImage() {
    if (!form.content_en && !imagePrompt) {
      toast.error("Please enter English content or an image prompt first.");
      return;
    }
    
    setGeneratingImage(true);
    const loadingToast = toast.loading("🎨 Generating 16:9 cover image with AI (Flux)...");
    
    try {
      const selectedCategory = categories.find((c) => c.id === form.category_id)?.name_en || "";
      const selectedTags = tags.filter((t) => form.tag_ids.includes(t.id)).map((t) => t.name_en);

      const res = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          title: form.title_en,
          category: selectedCategory,
          tags: selectedTags,
          slug: form.slug || slugify(form.title_en),
          imageId: "thumbnail",
          imageType: "thumbnail",
          postDetails: `Title: ${form.title_en}\nCategory: ${selectedCategory}\nTags: ${selectedTags.join(", ")}\nExcerpt: ${form.excerpt_en}\n\nContent: ${form.content_en}`,
          modelName: imageModel,
          style: imageStyle,
          provider: preferredProvider,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      
      setForm((prev) => ({ ...prev, cover_image_url: data.url }));
      if (data.promptUsed && !imagePrompt) {
        setImagePrompt(data.promptUsed);
      }
      
      setCompletedTasks(prev => ({ ...prev, image: true }));
      toast.success("Cover image generated and attached successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Generation failed: " + err.message);
    } finally {
      toast.dismiss(loadingToast);
      setGeneratingImage(false);
    }
  }

  async function handleGenerateContentImage(img: ContentImage, silent = false) {
    if (!img.prompt && !form.title_en) {
      if (!silent) toast.error("An image prompt or post title is required to generate this diagram.");
      throw new Error("Missing prompt or title");
    }

    setGeneratingContentImageId(img.id);
    let toastId: string | undefined = undefined;
    if (!silent) {
      toastId = toast.loading(`🎨 Generating ${img.id} visual (${img.alt_en || "diagram"})...`);
    }

    try {
      const selectedCategory = categories.find((c) => c.id === form.category_id)?.name_en || "";
      const selectedTags = tags.filter((t) => form.tag_ids.includes(t.id)).map((t) => t.name_en);

      const res = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: img.prompt,
          title: form.title_en,
          slug: form.slug || slugify(form.title_en),
          imageId: img.id,
          imageType: "content",
          category: selectedCategory,
          tags: selectedTags,
          style: imageStyle,
          provider: preferredProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate visual");

      setContentImages((prev) =>
        prev.map((item) =>
          item.id === img.id ? { ...item, url: data.url, status: "completed" } : item
        )
      );

      if (!silent) toast.success(`✨ Visual ${img.id} generated successfully!`);
      return data.url;
    } catch (err: any) {
      if (!silent) toast.error(err?.message || "Visual generation failed");
      throw err;
    } finally {
      if (toastId) toast.dismiss(toastId);
      setGeneratingContentImageId(null);
    }
  }

  async function handleGenerateAllContentImages() {
    const pendingImages = contentImages.filter((img) => !img.url);
    if (!pendingImages.length) {
      toast("All detected visuals already have images generated!", { icon: "ℹ️" });
      return;
    }

    setGeneratingAllContentImages(true);
    let successCount = 0;
    const batchToast = toast.loading(`🎨 Starting batch generation for ${pendingImages.length} visual(s)...`);

    for (let i = 0; i < pendingImages.length; i++) {
      const img = pendingImages[i];

      // Rate limit protection: polite 2s cooldown delay between consecutive requests
      if (i > 0) {
        toast.loading(`⏳ Rate limit cooldown (2s) before visual ${i + 1}/${pendingImages.length}...`, { id: batchToast });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      toast.loading(`🎨 Generating visual [${i + 1}/${pendingImages.length}]: ${img.id}...`, { id: batchToast });

      let attempts = 0;
      let success = false;
      while (attempts < 2 && !success) {
        attempts++;
        try {
          await handleGenerateContentImage(img, true);
          success = true;
          successCount++;
        } catch (e: any) {
          console.warn(`[Batch Generate] Attempt ${attempts} failed for ${img.id}:`, e?.message);
          if (attempts < 2) {
            // Wait 3s before retry
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      }
    }

    toast.dismiss(batchToast);
    setGeneratingAllContentImages(false);
    toast.success(`🎉 Batch complete! Generated ${successCount}/${pendingImages.length} visual(s) without rate-limit issues.`);
  }

  function handleReplaceImageMarkers(targetId?: string) {
    const imagesToProcess = targetId
      ? contentImages.filter((img) => img.id === targetId && img.url)
      : contentImages.filter((img) => img.url);

    if (!imagesToProcess.length) {
      toast.error("No generated images available to insert into the markdown text.");
      return;
    }

    let updatedEn = form.content_en;
    let updatedBn = form.content_bn;
    let replacedCount = 0;

    for (const img of imagesToProcess) {
      const marker = img.placement_marker || `{{IMAGE:${img.id}}}`;
      const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedMarker, "g");

      const mdEn = `\n\n![${img.alt_en || img.caption_en || form.title_en}](${img.url}${img.caption_en ? ` "${img.caption_en}"` : ""})\n\n`;
      const mdBn = `\n\n![${img.alt_bn || img.caption_bn || form.title_bn || form.title_en}](${img.url}${img.caption_bn ? ` "${img.caption_bn}"` : ""})\n\n`;

      if (updatedEn.includes(marker)) {
        updatedEn = updatedEn.replace(regex, mdEn);
        replacedCount++;
      }
      if (updatedBn.includes(marker)) {
        updatedBn = updatedBn.replace(regex, mdBn);
      }
    }

    if (replacedCount === 0) {
      toast("No matching markers found in the article text. They may have already been replaced!", { icon: "ℹ️" });
      return;
    }

    setForm((prev) => ({
      ...prev,
      content_en: updatedEn,
      content_bn: updatedBn,
    }));

    toast.success(`✨ Replaced ${replacedCount} image marker(s) with Markdown tags in both English and বাংলা articles!`);
  }

  function handleDetectImageMarkersFromContent() {
    const regex = /\{\{IMAGE:(img-[0-9a-zA-Z_-]+)\}\}/g;
    const foundMarkers = new Set<string>();
    let match;

    while ((match = regex.exec(form.content_en)) !== null) {
      foundMarkers.add(match[1]);
    }
    while ((match = regex.exec(form.content_bn)) !== null) {
      foundMarkers.add(match[1]);
    }

    if (foundMarkers.size === 0) {
      toast("No {{IMAGE:img-N}} markers detected in the content.", { icon: "ℹ️" });
      return;
    }

    const existingIds = new Set(contentImages.map((i) => i.id));
    const newItems: ContentImage[] = [];

    foundMarkers.forEach((id) => {
      if (!existingIds.has(id)) {
        newItems.push({
          id,
          placement_marker: `{{IMAGE:${id}}}`,
          prompt: `Technical architecture diagram illustrating ${form.title_en || "the system workflow"}, glassmorphism cyberpunk neon aesthetic, cyan and purple palette, 16:9 widescreen, octane render, no text`,
          alt_en: `Diagram for ${form.title_en || "article concept"}`,
          alt_bn: `${form.title_bn || form.title_en || "আর্টিকেলের ডায়াগ্রাম"}`,
          caption_en: "",
          caption_bn: "",
          url: null,
          status: "pending",
        });
      }
    });

    if (newItems.length > 0) {
      setContentImages((prev) => [...prev, ...newItems]);
      toast.success(`Detected and registered ${newItems.length} new image marker(s)!`);
    } else {
      toast(`All ${foundMarkers.size} detected markers are already in the list.`, { icon: "ℹ️" });
    }
  }

  async function handleGenerateImagePrompt() {
    if (!form.title_en && !form.content_en) {
      toast.error("Please enter English Title or Content first so AI can analyze the post topic.");
      return;
    }

    setGeneratingImagePrompt(true);
    const toastId = toast.loading("💡 Analyzing post & generating topic-focused prompt...");

    try {
      const selectedCategory = categories.find((c) => c.id === form.category_id)?.name_en || "";
      const selectedTags = tags.filter((t) => form.tag_ids.includes(t.id)).map((t) => t.name_en);

      const res = await fetch("/api/admin/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title_en,
          excerpt: form.excerpt_en,
          content: form.content_en,
          category: selectedCategory,
          tags: selectedTags,
          style: imageStyle,
          provider: preferredProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prompt");

      setImagePrompt(data.prompt);
      if (data.theme || data.color_palette || data.concept) {
        setPromptMeta({
          theme: data.theme,
          color_palette: data.color_palette,
          concept: data.concept,
        });
      }
      toast.success("💡 Post-tailored prompt generated! Click 'Generate Image' to create.", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to generate prompt", { id: toastId });
    } finally {
      setGeneratingImagePrompt(false);
    }
  }

  async function handleAutoOptimizeSEO() {
    if (!form.title_en.trim() || !form.content_en.trim()) {
      toast.error("Please enter English Title and Content first to auto-optimize SEO.");
      return;
    }

    setAutoOptimizingSEO(true);
    const toastId = toast.loading("🚀 Auto-optimizing SEO & GEO metadata with AI...");

    try {
      const res = await fetch("/api/admin/generate-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title_en,
          content: form.content_en,
          provider: preferredProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to auto-optimize SEO");

      // Auto-extract clean excerpt if missing
      const autoExcerptEn = form.excerpt_en || data.meta_desc_en || form.content_en.slice(0, 155).trim();
      const autoExcerptBn = form.excerpt_bn || data.meta_desc_bn || "";

      // Auto-generate slug if missing
      const autoSlug =
        form.slug ||
        form.title_en
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

      setForm((prev) => ({
        ...prev,
        seo_title_en: data.seo_title_en || prev.seo_title_en,
        meta_desc_en: data.meta_desc_en || prev.meta_desc_en,
        seo_title_bn: data.seo_title_bn || prev.seo_title_bn,
        meta_desc_bn: data.meta_desc_bn || prev.meta_desc_bn,
        excerpt_en: autoExcerptEn,
        excerpt_bn: autoExcerptBn || prev.excerpt_bn,
        slug: autoSlug,
      }));

      setCompletedTasks((prev) => ({ ...prev, seo: true, meta: true }));
      toast.success("🎉 SEO & GEO metadata auto-optimized to 95+ score!", { id: toastId });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Auto-optimization failed", { id: toastId });
    } finally {
      setAutoOptimizingSEO(false);
      fetchQuotas();
    }
  }

  // Fetch API Quotas
  const fetchQuotas = useCallback(async () => {
    setLoadingQuotas(true);
    try {
      const res = await fetch("/api/admin/ai-quota");
      if (res.ok) {
        const data = await res.json();
        setQuotas(data.quotas || []);
      }
    } catch (err) {
      console.error("Failed to fetch quotas", err);
    } finally {
      setLoadingQuotas(false);
    }
  }, []);

  // Fetch quotas when switching to AI tab
  useEffect(() => {
    if (activeTab === "ai" && quotas.length === 0 && !loadingQuotas) {
      fetchQuotas();
    }
  }, [activeTab, quotas.length, loadingQuotas, fetchQuotas]);

  async function handleAutoTranslate() {
    if (!form.title_en.trim() || !form.content_en.trim()) {
      toast.error("Please write English Title and Content first.");
      return;
    }
    setTranslating(true);
    const toastId = toast.loading("Translating Title, Excerpt & Content to Bengali with AI...");
    try {
      const res = await fetch("/api/admin/translate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_en: form.title_en,
          excerpt_en: form.excerpt_en,
          content_en: form.content_en,
          provider: preferredProvider,
        }),
      });

      const textResponse = await res.text();
      let data: any;
      try {
        data = JSON.parse(textResponse);
      } catch {
        let msg = "Server error occurred during translation.";
        if (textResponse.includes("FUNCTION_INVOCATION_TIMEOUT") || textResponse.includes("timeout")) {
          msg = "Translation timed out. The content may be too long for a single request.";
        } else if (textResponse.includes("An error occurred")) {
          msg = "Serverless limit reached. Please ensure GEMINI_API_KEY is configured in Vercel settings.";
        }
        throw new Error(msg);
      }

      if (!res.ok) throw new Error(data.error || "Failed to translate");

      setForm((prev) => ({
        ...prev,
        title_bn: data.title_bn || prev.title_bn,
        excerpt_bn: data.excerpt_bn || prev.excerpt_bn,
        content_bn: data.content_bn || prev.content_bn,
      }));
      setCompletedTasks(prev => ({ ...prev, translate: true }));
      toast.success("✨ Translated to Bengali! Switched to বাংলা tab.", { id: toastId });
      setActiveTab("bangla");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Translation failed", { id: toastId });
    } finally {
      setTranslating(false);
      fetchQuotas();
    }
  }

  async function handleGenerateMeta() {
    if (!form.content_en.trim()) {
      toast.error("Please write English Content first.");
      return;
    }
    setGeneratingMeta(true);
    try {
      const res = await fetch("/api/admin/generate-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_en: form.content_en, provider: preferredProvider }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate meta");

      // Set excerpts
      setForm((prev) => ({
        ...prev,
        excerpt_en: data.excerpt_en || prev.excerpt_en,
        excerpt_bn: data.excerpt_bn || prev.excerpt_bn,
      }));

      // Handle suggested tags
      if (data.tags && Array.isArray(data.tags)) {
        const newTagIds: string[] = [];
        data.tags.forEach((suggestedTagName: string) => {
          // Find if this tag exists in our global tags list
          const existingTag = tags.find(
            (t) => t.name_en.toLowerCase() === suggestedTagName.toLowerCase()
          );
          if (existingTag) {
            newTagIds.push(existingTag.id);
          }
        });

        // Merge without duplicates
        const uniqueTags = Array.from(new Set([...form.tag_ids, ...newTagIds]));
        setForm((prev) => ({ ...prev, tag_ids: uniqueTags }));
        
        setCompletedTasks(prev => ({ ...prev, meta: true }));
        toast.success(`✨ Generated excerpts & found ${newTagIds.length} matching tags!`);
      } else {
        setCompletedTasks(prev => ({ ...prev, meta: true }));
        toast.success("✨ Excerpts generated successfully!");
      }

    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate meta");
    } finally {
      setGeneratingMeta(false);
      fetchQuotas();
    }
  }

  // ─── Cross-post to DEV.to ───────────────────────────────────────────────────
  async function handleCrossPost() {
    const title = form.title_en.trim();
    const content = form.content_en.trim();

    if (!title || !content) {
      toast.error("English title and content are required before cross-posting.");
      return;
    }

    // Build tags from socialData or parsedJsonData
    const devtoTags: string[] =
      socialData?.devto_tags?.length
        ? socialData.devto_tags
        : (parsedJsonData?.social?.devto_tags ?? []);

    // Use the DEV.to article from socialData or JSON if it exists, else use raw content
    const articleContent: string =
      socialData?.devto_article?.trim() ||
      parsedJsonData?.social?.devto_article?.trim() ||
      content;

    const devtoTitle: string =
      socialData?.devto_title?.trim() ||
      parsedJsonData?.social?.devto_title?.trim() ||
      title;

    // Canonical URL keeps SEO juice on your portfolio
    const canonicalUrl = form.slug
      ? `https://zahidhasantonmoy.vercel.app/blog/${form.slug}`
      : undefined;

    setCrossPosting((p) => ({ ...p, devto: true }));
    setCrossPostResult((p) => ({ ...p, devto: null }));

    try {
      const res = await fetch("/api/admin/cross-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "devto",
          title: devtoTitle,
          content: articleContent,
          tags: devtoTags,
          canonicalUrl,
          coverImage: form.cover_image_url || undefined,
          description: form.meta_desc_en || form.excerpt_en || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "DEV.to cross-post failed");
      }

      setCrossPostResult((p) => ({
        ...p,
        devto: { url: data.url, status: data.status },
      }));

      toast.success(`✅ Posted to DEV.to as ${data.status}! Opening...`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "DEV.to cross-post failed");
    } finally {
      setCrossPosting((p) => ({ ...p, devto: false }));
    }
  };

  const EXAMPLE_JSON_STRUCTURE = `{
  "slug": "mastering-autonomous-ai-agents",
  "canonical_url": "https://zahidhasantonmoy.vercel.app/blog/mastering-autonomous-ai-agents",
  "language_alternate": {
    "en": "https://zahidhasantonmoy.vercel.app/blog/mastering-autonomous-ai-agents",
    "bn": "https://zahidhasantonmoy.vercel.app/bn/blog/mastering-autonomous-ai-agents"
  },
  "published_date": "${new Date().toISOString().split("T")[0]}",
  "updated_date": "${new Date().toISOString().split("T")[0]}",
  "author": "Zahid Hasan Tonmoy",
  "status": "draft",
  "category": "ai-agent-development",
  "tags": [ "ai-agent", "nextjs", "react", "typescript" ],
  "reading_time_minutes": 8,
  "english": {
    "title": "Mastering Autonomous AI Agents with Next.js 14 and LangChain",
    "article": "# Mastering Autonomous AI Agents with Next.js 14 and LangChain\\n\\nAutonomous agents represent the next major evolution in full-stack web engineering. Rather than traditional static handlers, an autonomous agent continuously observes its state, plans multi-step tool interactions, and executes decisions using LLMs.\\n\\n## Architectural Overview\\n\\n{{IMAGE:img-1}}\\n\\nIn a modern Next.js 14 App Router architecture, the agent execution loop runs inside a secure server action or Route Handler:\\n\\n\`\`\`typescript\\n// src/lib/agent/executor.ts\\nimport { ChatOpenAI } from '@langchain/openai';\\nimport { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';\\nimport { pull } from 'langchain/hub';\\nimport { searchTool, databaseTool } from './tools';\\n\\nexport async function runAgentWorkflow(userGoal: string) {\\n  const llm = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0 });\\n  const tools = [searchTool, databaseTool];\\n  const prompt = await pull<any>('hwchase17/openai-tools-agent');\\n\\n  const agent = await createOpenAIToolsAgent({ llm, tools, prompt });\\n  const executor = new AgentExecutor({ agent, tools, verbose: true });\\n\\n  return await executor.invoke({ input: userGoal });\\n}\\n\`\`\`\\n\\n## Streaming Real-Time Tool Invocations to the UI\\n\\n{{IMAGE:img-2}}\\n\\nTo provide a seamless client experience, we stream agent thoughts and tool outputs directly into React components:\\n\\n\`\`\`tsx\\n// src/components/AgentFeed.tsx\\n'use client';\\nimport { useChat } from 'ai/react';\\n\\nexport default function AgentFeed() {\\n  const { messages, input, handleInputChange, handleSubmit } = useChat();\\n  return (\\n    <div className=\\\"max-w-2xl mx-auto p-6 space-y-4\\\">\\n      {messages.map((m) => (\\n        <div key={m.id} className={m.role === 'user' ? 'text-indigo-600' : 'text-gray-200'}>\\n          {m.content}\\n        </div>\\n      ))}\\n    </div>\\n  );\\n}\\n\`\`\`\\n\\n## Frequently Asked Questions\\n\\n### What are autonomous AI agents?\\nAutonomous agents are software systems powered by LLMs that observe an environment, make iterative decisions, and take actions using tools.\\n\\n### Can I run AI agents with Next.js server actions?\\nYes, server actions provide secure server-side execution environments with streaming support."
  },
  "bangla": {
    "title": "নেক্সট জেএস ও ল্যাংচেইন দিয়ে স্বয়ংক্রিয় এআই এজেন্ট ডেভেলপমেন্ট",
    "article": "# অটোনোমাস এআই এজেন্ট ডেভেলপমেন্ট\\n\\nওয়েব ডেভেলপমেন্ট ও আর্টিফিশিয়াল ইন্টেলিজেন্সের সমন্বয়ে আধুনিক সফটওয়্যার আর্কিটেকচার দ্রুত পরিবর্তিত হচ্ছে।\\n\\n## আর্কিটেকচার ও মূল কনসেপ্ট\\n\\n{{IMAGE:img-1}}\\n\\nNext.js 14 App Router-এ সিকিউর সার্ভার অ্যাকশনের মাধ্যমে এআই এজেন্টের টুল কলিং লজিক রান করা যায়:\\n\\n\`\`\`typescript\\n// src/lib/agent/executor.ts\\nimport { ChatOpenAI } from '@langchain/openai';\\nimport { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';\\nimport { pull } from 'langchain/hub';\\n\\nexport async function runAgentWorkflow(userGoal: string) {\\n  const llm = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0 });\\n  const prompt = await pull<any>('hwchase17/openai-tools-agent');\\n  const agent = await createOpenAIToolsAgent({ llm, tools: [], prompt });\\n  return new AgentExecutor({ agent, tools: [] });\\n}\\n\`\`\`\\n\\n## ক্লায়েন্টে লাইভ স্ট্রিমিং ইন্টারফেস\\n\\n{{IMAGE:img-2}}\\n\\nইউজারদের কাছে রিয়েল-টাইম আউটপুট দেখানোর জন্য আমরা রিয়্যাক্ট কম্পোনেন্ট ব্যবহার করি:\\n\\n\`\`\`tsx\\n// src/components/AgentFeed.tsx\\n'use client';\\nimport { useChat } from 'ai/react';\\n\\nexport default function AgentFeed() {\\n  const { messages } = useChat();\\n  return (\\n    <div className=\\\"space-y-3\\\">\\n      {messages.map((m) => (\\n        <p key={m.id}>{m.content}</p>\\n      ))}\\n    </div>\\n  );\\n}\\n\`\`\`\\n\\n## প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)\\n\\n### অটোনোমাস এআই এজেন্ট কী?\\nঅটোনোমাস এআই এজেন্ট হলো এমন একটি ইন্টেলিজেন্ট সিস্টেম যা মানুষের সরাসরি হস্তক্ষেপ ছাড়াই বিভিন্ন টুলস ব্যবহার করে কাজ সম্পন্ন করতে পারে।\\n\\n### নেক্সট জেএস দিয়ে কি এআই এজেন্ট বানানো সম্ভব?\\nহ্যাঁ, Next.js Server Actions ও Streaming API ব্যবহার করে খুব সহজেই হাই-পারফরম্যান্স এআই এজেন্ট তৈরি করা যায়।"
  },
  "content_images": [
    {
      "id": "img-1",
      "placement_marker": "{{IMAGE:img-1}}",
      "prompt": "Technical architecture diagram illustrating distributed autonomous AI agent execution loop with server actions and LLM tools, glassmorphism cyberpunk neon aesthetic, cyan and purple palette, 16:9 widescreen, octane render, no text",
      "alt_en": "Autonomous AI Agent Workflow Architecture Diagram",
      "alt_bn": "অটোনোমাস এআই এজেন্ট আর্কিটেকচার ডায়াগ্রাম",
      "caption_en": "Figure 1: High-level Agent Execution Lifecycle",
      "caption_bn": "চিত্র ১: এজেন্টের লাইফসাইকেল ডায়াগ্রাম",
      "url": null
    },
    {
      "id": "img-2",
      "placement_marker": "{{IMAGE:img-2}}",
      "prompt": "Interactive UI data stream pipeline visualization connecting frontend components to AI agent thoughts, glowing glassmorphic nodes, dark violet background, 16:9 widescreen, octane render, no text",
      "alt_en": "Real-time Streaming UI Architecture",
      "alt_bn": "রিয়েল-টাইম স্ট্রিমিং ইউআই আর্কিটেকচার",
      "caption_en": "Figure 2: Streaming Agent Thoughts to UI",
      "caption_bn": "চিত্র ২: ফ্রন্টএন্ডে লাইভ স্ট্রিমিং আর্কিটেকচার",
      "url": null
    }
  ],
  "faq": [
    {
      "question_en": "What are autonomous AI agents?",
      "answer_en": "Autonomous agents are software systems powered by LLMs that observe an environment, make iterative decisions, and take actions using tools.",
      "question_bn": "অটোনোমাস এআই এজেন্ট কী?",
      "answer_bn": "অটোনোমাস এআই এজেন্ট হলো এমন একটি ইন্টেলিজেন্ট সিস্টেম যা মানুষের সরাসরি হস্তক্ষেপ ছাড়াই বিভিন্ন টুলস ব্যবহার করে কাজ সম্পন্ন করতে পারে।"
    },
    {
      "question_en": "Can I run AI agents with Next.js server actions?",
      "answer_en": "Yes, server actions provide secure server-side execution environments with streaming support.",
      "question_bn": "নেক্সট জেএস দিয়ে কি এআই এজেন্ট বানানো সম্ভব?",
      "answer_bn": "হ্যাঁ, Next.js Server Actions ও Streaming API ব্যবহার করে খুব সহজেই হাই-পারফরম্যান্স এআই এজেন্ট তৈরি করা যায়।"
    }
  ],
  "excerpt": {
    "english": "A comprehensive deep dive into building autonomous AI agents with Next.js, LangChain, and modern full-stack architectures.",
    "bangla": "নেক্সট জেএস এবং ল্যাংচেইন আর্কিটেকচার ব্যবহার করে স্বয়ংক্রিয় এআই এজেন্ট ও ফুল-স্ট্যাক প্রজেক্ট তৈরির পূর্ণাঙ্গ গাইড।"
  },
  "seo": {
    "meta_description_bn": "নেক্সট জেএস এবং ল্যাংচেইন দিয়ে স্বয়ংক্রিয় এআই এজেন্ট তৈরির সম্পূর্ণ হ্যান্ডস-অন গাইড।",
    "seo_title_bn": "নেক্সট জেএস ও ল্যাংচেইন দিয়ে এআই এজেন্ট ডেভেলপমেন্ট",
    "meta_description_en": "Learn how to architect, develop, and deploy production-grade autonomous AI agents using Next.js 14 and LangChain.",
    "seo_title_en": "Mastering Autonomous AI Agents with Next.js 14",
    "primary_keyword_en": "How to build AI Agents with Next.js",
    "secondary_keywords_en": [ "LangChain autonomous agent architecture", "Next.js AI streaming tool calling", "production AI workflows" ],
    "primary_keyword_bn": "নেক্সট জেএস দিয়ে এআই এজেন্ট তৈরি",
    "secondary_keywords_bn": [ "স্বয়ংক্রিয় এআই এজেন্ট টিউটোরিয়াল", "ল্যাংচেইন দিয়ে এআই এজেন্ট", "নেক্সট জেএস টিউটোরিয়াল বাংলা" ],
    "search_intent": "tutorial"
  },
  "social": {
    "linkedin_post_en": "🚀 Deep Dive: How to architect autonomous AI agents using Next.js 14, streaming UI, and LangChain...\\n\\nKey takeaways:\\n1. Server Actions for safe tool execution\\n2. Real-time token streaming with AI SDK\\n3. Resilience and self-healing memory\\n\\nRead the full guide: https://zahidhasantonmoy.vercel.app/blog/mastering-autonomous-ai-agents",
    "linkedin_hashtags_en": [ "#WebDev", "#Nextjs", "#AIAgents", "#LangChain", "#FullStack" ],
    "linkedin_post_bn": "🚀 নেক্সট জেএস ১৪ এবং ল্যাংচেইন দিয়ে অটোনোমাস এআই এজেন্ট আর্কিটেকচার তৈরি করার প্র্যাকটিক্যাল গাইড!\\n\\nমূল আলোচ্য বিষয়:\\n১. সার্ভার অ্যাকশন ও টুল কলিং সিকিউরিটি\\n২. রিয়্যাক্ট ক্লায়েন্টে রিয়েল-টাইম লাইভ স্ট্রিমিং\\n৩. মেমোরি পারসিস্টেন্স ও ফলব্যাক হ্যান্ডলিং\\n\\nসম্পূর্ণ বাংলা আর্টিকেলটি পড়ুন: https://zahidhasantonmoy.vercel.app/bn/blog/mastering-autonomous-ai-agents",
    "linkedin_hashtags_bn": [ "#ওয়েবডেভেলপমেন্ট", "#নেক্সটজেএস", "#প্রোগ্রামিং", "#বাংলাটিউটোরিয়াল", "#TechBangladesh" ],
    "devto_title": "Mastering Autonomous AI Agents with Next.js 14 and LangChain",
    "devto_article": "Complete DEV.to formatted markdown article...",
    "devto_tags": [ "ai", "nextjs", "javascript", "webdev" ]
  },
  "thumbnail": {
    "prompt": "Futuristic developer workstation with holographic AI agent neural lattice, glowing neon cyan and purple data highways, ultra-detailed 3D glassmorphism, 16:9 cinematic ratio, no text",
    "text": "AI Agents in Next.js",
    "aspect_ratio": "16:9"
  },
  "og_image_en": "https://zahidhasantonmoy.vercel.app/blog/mastering-autonomous-ai-agents/opengraph-image",
  "og_image_bn": "https://zahidhasantonmoy.vercel.app/bn/blog/mastering-autonomous-ai-agents/opengraph-image",
  "word_count": {
    "english": 1450,
    "bangla": 1380
  },
  "links": {
    "github": "https://github.com/zahidhasantonmoy",
    "portfolio": "https://zahidhasantonmoy.vercel.app"
  },
  "branding": {
    "angle": "Specializing in bleeding-edge AI integration and scalable full-stack web applications."
  }
}`;

  const handleJsonInputChange = (val: string) => {
    setJsonInput(val);
    if (!val.trim()) {
      setParsedJsonData(null);
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(val.trim());
      setParsedJsonData(parsed);
      setJsonError(null);
    } catch (err: any) {
      setParsedJsonData(null);
      setJsonError(err?.message || "Invalid JSON syntax");
    }
  };

  const applyJsonToForm = (customJson?: string) => {
    const raw = customJson ?? jsonInput;
    if (!raw.trim()) {
      toast.error("Please paste or load JSON first");
      return;
    }

    try {
      const data = JSON.parse(raw.trim());

      let parsedSlug = data.slug || "";
      if (!parsedSlug && data.canonical_url) {
        const parts = String(data.canonical_url).split("/blog/");
        if (parts[1]) parsedSlug = parts[1].replace(/\/$/, "");
      }
      if (!parsedSlug && data.blog_url) {
        const parts = String(data.blog_url).split("/blog/");
        if (parts[1]) parsedSlug = parts[1].replace(/\/$/, "");
      }
      if (!parsedSlug && data.english?.title) {
        parsedSlug = slugify(data.english.title);
      }

      const title_en = data.english?.title || data.title_en || "";
      let content_en = data.english?.article || data.english?.content || data.content_en || "";
      const excerpt_en = data.excerpt?.english || data.excerpt?.en || data.excerpt_en || "";

      const title_bn = data.bangla?.title || data.title_bn || "";
      let content_bn = data.bangla?.article || data.bangla?.content || data.content_bn || "";
      const excerpt_bn = data.excerpt?.bangla || data.excerpt?.bn || data.excerpt_bn || "";

      // FAQ section auto-integration if not already in markdown
      if (Array.isArray(data.faq) && data.faq.length > 0) {
        if (content_en && !content_en.includes("Frequently Asked Questions") && !content_en.includes("## FAQ")) {
          content_en += "\n\n## Frequently Asked Questions\n\n" + data.faq.map((f: any) => `### ${f.question_en || f.question || ""}\n${f.answer_en || f.answer || ""}`).join("\n\n");
        }
        if (content_bn && !content_bn.includes("প্রশ্নাবলী") && !content_bn.includes("FAQ")) {
          content_bn += "\n\n## প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)\n\n" + data.faq.map((f: any) => `### ${f.question_bn || f.question_en || f.question || ""}\n${f.answer_bn || f.answer_en || f.answer || ""}`).join("\n\n");
        }
      }

      const seo_title_en = data.seo?.seo_title_en || title_en;
      const seo_title_bn = data.seo?.seo_title_bn || title_bn;
      const meta_desc_en = data.seo?.meta_description_en || excerpt_en;
      const meta_desc_bn = data.seo?.meta_description_bn || excerpt_bn;

      if (data.thumbnail?.prompt) {
        setImagePrompt(data.thumbnail.prompt);
      }

      if (Array.isArray(data.content_images) && data.content_images.length > 0) {
        const importedImages = data.content_images.map((img: any, idx: number) => ({
          id: img.id || `img-${idx + 1}`,
          placement_marker: img.placement_marker || `{{IMAGE:${img.id || `img-${idx + 1}`}}}`,
          prompt: img.prompt || "",
          alt_en: img.alt_en || "",
          alt_bn: img.alt_bn || "",
          caption_en: img.caption_en || "",
          caption_bn: img.caption_bn || "",
          url: img.url || null,
          status: img.url ? "completed" : "pending",
        }));
        setContentImages(importedImages);
        saveImagesToStorage(importedImages);
      }

      // Sync imported social data to persistent social state & localStorage
      if (data.social) {
        const s = data.social;
        const mappedSocial: SocialData = {
          linkedin_post_en: s.linkedin_post_en || s.linkedin_post || "",
          linkedin_hashtags_en: Array.isArray(s.linkedin_hashtags_en)
            ? s.linkedin_hashtags_en
            : Array.isArray(s.linkedin_hashtags)
            ? s.linkedin_hashtags
            : [],
          linkedin_post_bn: s.linkedin_post_bn || "",
          linkedin_hashtags_bn: Array.isArray(s.linkedin_hashtags_bn) ? s.linkedin_hashtags_bn : [],
          devto_title: s.devto_title || title_en,
          devto_article: s.devto_article || content_en,
          devto_tags: Array.isArray(s.devto_tags) ? s.devto_tags : [],
          twitter_post: s.twitter_post || "",
        };
        setSocialData(mappedSocial);
        saveSocialToStorage(mappedSocial);
      }

      // Match category
      let matchedCategoryId: string | undefined = undefined;
      if (data.category && categories && categories.length > 0) {
        const catQuery = String(data.category).toLowerCase().trim();
        const matchedCategory = categories.find(
          (c) =>
            c.slug.toLowerCase() === catQuery ||
            c.name_en.toLowerCase() === catQuery ||
            c.name_en.toLowerCase().includes(catQuery) ||
            catQuery.includes(c.slug.toLowerCase())
        );
        if (matchedCategory) {
          matchedCategoryId = matchedCategory.id;
        }
      }

      // Match tags with English and Bengali keywords
      const importedKeywords: string[] = [
        ...(Array.isArray(data.tags) ? data.tags : []),
        ...(Array.isArray(data.social?.devto_tags) ? data.social.devto_tags : []),
        ...(Array.isArray(data.seo?.secondary_keywords_en) ? data.seo.secondary_keywords_en : []),
        ...(Array.isArray(data.seo?.secondary_keywords) ? data.seo.secondary_keywords : []),
        ...(Array.isArray(data.seo?.secondary_keywords_bn) ? data.seo.secondary_keywords_bn : []),
        ...(data.seo?.primary_keyword_en ? [data.seo.primary_keyword_en] : []),
        ...(data.seo?.primary_keyword ? [data.seo.primary_keyword] : []),
        ...(data.seo?.primary_keyword_bn ? [data.seo.primary_keyword_bn] : []),
      ].map((k: string) => String(k).toLowerCase().trim().replace(/^#/, ""));

      const matchedTagIds: string[] = [];
      if (tags && tags.length > 0 && importedKeywords.length > 0) {
        tags.forEach((t) => {
          const nameLower = t.name_en.toLowerCase();
          const slugLower = t.slug.toLowerCase();
          if (
            importedKeywords.some(
              (kw) => kw === nameLower || kw === slugLower || nameLower.includes(kw) || kw.includes(nameLower)
            )
          ) {
            if (!matchedTagIds.includes(t.id)) matchedTagIds.push(t.id);
          }
        });
      }

      const readTime = Number(data.reading_time_minutes || data.read_time_min) || (content_en ? Math.max(1, Math.ceil(content_en.trim().split(/\s+/).length / 200)) : undefined);
      
      // Smart Future Date Detection for Automated Scheduling
      const rawDateStr = data.published_date || data.published_at;
      const parsedDateInfo = parsePublishDate(rawDateStr);

      let postStatus = (data.status === "draft" || data.status === "published" || data.status === "scheduled") ? data.status : undefined;
      if (parsedDateInfo.isFuture) {
        postStatus = "scheduled";
      }

      const publishedAt = parsedDateInfo.formattedInput || rawDateStr || undefined;

      setForm((prev) => ({
        ...prev,
        slug: parsedSlug || prev.slug,
        title_en: title_en || prev.title_en,
        content_en: content_en || prev.content_en,
        excerpt_en: excerpt_en || prev.excerpt_en,
        title_bn: title_bn || prev.title_bn,
        content_bn: content_bn || prev.content_bn,
        excerpt_bn: excerpt_bn || prev.excerpt_bn,
        seo_title_en: seo_title_en || prev.seo_title_en,
        seo_title_bn: seo_title_bn || prev.seo_title_bn,
        meta_desc_en: meta_desc_en || prev.meta_desc_en,
        meta_desc_bn: meta_desc_bn || prev.meta_desc_bn,
        category_id: matchedCategoryId ?? prev.category_id,
        tag_ids: matchedTagIds.length > 0 ? Array.from(new Set([...prev.tag_ids, ...matchedTagIds])) : prev.tag_ids,
        read_time_min: readTime ?? prev.read_time_min,
        status: postStatus ?? prev.status,
        published_at: publishedAt ?? prev.published_at,
      }));

      setParsedJsonData(data);
      if (parsedDateInfo.isFuture) {
        const formattedDateDisplay = new Date(parsedDateInfo.isoString!).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const formattedTimeDisplay = new Date(parsedDateInfo.isoString!).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        toast.success(
          `⏰ Future date detected (${formattedDateDisplay} at ${formattedTimeDisplay}). Article automatically scheduled!`,
          { duration: 6000 }
        );
      } else {
        toast.success("✨ All blog fields auto-filled successfully from JSON!");
      }
      setActiveTab("english");

    } catch (err: any) {
      toast.error("JSON Error: " + (err?.message || "Invalid JSON"));
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "english", label: "🇬🇧 English" },
    { id: "bangla", label: "🇧🇩 বাংলা" },
    { id: "ai", label: "✨ AI Assistant" },
    { id: "social", label: "📱 Social & Cross-Post" },
    { id: "json", label: "📥 JSON Import" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
            📝 Blog Post
          </span>
          {form.status === "scheduled" ? (
            <button
              type="button"
              onClick={() => {
                setScheduleDate(form.published_at || formatForDatetimeInput(new Date()));
                setShowScheduleModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/50 hover:bg-blue-900/60 transition active:scale-95 group shadow-sm cursor-pointer"
              title="Click to view, adjust or unschedule"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
              <span>
                ⏰ Scheduled:{" "}
                {form.published_at
                  ? `${new Date(form.published_at).toLocaleDateString([], { month: "short", day: "numeric" })} at ${new Date(form.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Pick time"}
              </span>
              {form.published_at && (
                <span className="text-[10px] text-blue-400/90 font-mono bg-blue-900/60 px-1.5 py-0.2 rounded border border-blue-500/30">
                  {getRelativeTimeMessage(form.published_at)}
                </span>
              )}
              <span className="text-[10px] text-blue-400 underline group-hover:text-white transition ml-0.5">
                Edit ↗
              </span>
            </button>
          ) : (
            <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
              form.status === "published"
                ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30"
                : "bg-yellow-900/40 text-yellow-400 border border-yellow-500/30"
            }`}>
              {form.status}
            </span>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-lg transition font-medium"
          >
            <span>📥 Auto-Fill from JSON</span>
          </button>
          <button
            type="button"
            onClick={handlePingIndexing}
            disabled={pingingIndex || !form.slug}
            title="Submit this article and sitemap directly to Google & Bing for rapid indexing"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg transition font-medium disabled:opacity-50"
          >
            <span>{pingingIndex ? "⚡ Pinging..." : "⚡ Ping Google & Bing"}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mode === "edit" && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition"
            >
              Delete
            </button>
          )}
          {/* DEV.to quick cross-post button */}
          {crossPostResult.devto ? (
            <a
              href={crossPostResult.devto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-700/50 rounded-lg font-semibold transition"
            >
              ✅ DEV.to Draft →
            </a>
          ) : (
            <button
              type="button"
              onClick={handleCrossPost}
              disabled={crossPosting.devto || !form.title_en.trim() || !form.content_en.trim()}
              title="Post to DEV.to as draft with canonical URL"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-gray-700/60 hover:bg-indigo-600/25 text-gray-300 hover:text-indigo-300 border border-gray-600 hover:border-indigo-500/50 rounded-lg transition font-medium disabled:opacity-40"
            >
              {crossPosting.devto ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting…
                </>
              ) : (
                <>📤 DEV.to</>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-3.5 py-1.5 text-xs sm:text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => {
              setScheduleDate(form.published_at || "");
              setShowScheduleModal(true);
            }}
            disabled={saving}
            className="px-3.5 py-1.5 text-xs sm:text-sm bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 rounded-lg transition disabled:opacity-50 font-medium flex items-center gap-1.5"
            title="Schedule post for future publication"
          >
            <span>⏰ Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-4 py-1.5 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 font-medium"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Live SEO & GEO Score Meter ── */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 shadow-lg backdrop-blur-md transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* Score Badge */}
            <div
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border font-mono font-bold text-base shadow-sm shrink-0 ${seoScoreData.badgeColor}`}
            >
              <span>{seoScoreData.score}</span>
              <span className="text-[9px] uppercase tracking-wider -mt-1 font-sans text-gray-400">/ 100</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">Live SEO & GEO Score</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${seoScoreData.badgeColor}`}>
                  {seoScoreData.grade}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time check for Google SERP Top 1 ranking & AI Overviews (ChatGPT, Perplexity, Gemini).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoOptimizeSEO}
              disabled={autoOptimizingSEO || !form.title_en}
              className="px-3.5 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg transition font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-900/40 disabled:opacity-50 active:scale-95"
              title="1-Click Auto Optimize SEO & GEO score with AI"
            >
              <span>{autoOptimizingSEO ? "✨ Optimizing..." : "✨ Auto Optimize SEO"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSeoDetails(!showSeoDetails)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg transition flex items-center gap-1"
            >
              <span>{showSeoDetails ? "Hide Checklist ▲" : "View Checklist ▼"}</span>
            </button>
            <button
              type="button"
              onClick={handlePingIndexing}
              disabled={pingingIndex || !form.slug}
              className="px-3 py-1.5 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/50 rounded-lg transition font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <span>{pingingIndex ? "⚡ Pinging..." : "⚡ Ping Google"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSerpPreview(true)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-500/30 rounded-lg transition font-medium flex items-center gap-1.5 active:scale-95"
              title="Preview Google SERP and Social Card snippet"
            >
              <span>🔍 Preview SERP</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${seoScoreData.progressColor}`}
            style={{ width: `${seoScoreData.score}%` }}
          />
        </div>

        {/* Detailed Checklist */}
        {showSeoDetails && (
          <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {seoScoreData.checks.map((c, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                  c.passed
                    ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300"
                    : "bg-gray-950/60 border-gray-800 text-gray-400"
                }`}
              >
                <span className="text-sm mt-0.5">{c.passed ? "✅" : "⚠️"}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block text-gray-200">{c.label}</span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">{c.tip}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── English Tab ── */}
      {activeTab === "english" && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title (English) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title_en}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="My First Laravel Tutorial"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-lg font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt (English)</label>
            <textarea
              value={form.excerpt_en}
              onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })}
              placeholder="A brief summary of this post (shown in listings)..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          <div
            data-color-mode="dark"
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (items) {
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.startsWith("image/")) {
                    const file = items[i].getAsFile();
                    if (file) {
                      e.preventDefault();
                      handleUploadAndInsertImage(file, "content_en");
                      break;
                    }
                  }
                }
              }
            }}
            onDrop={(e) => {
              const files = e.dataTransfer?.files;
              if (files && files.length > 0 && files[0].type.startsWith("image/")) {
                e.preventDefault();
                handleUploadAndInsertImage(files[0], "content_en");
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Content (English — Markdown)
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-indigo-300 rounded-lg border border-gray-700 transition">
                <span>📷 Upload / Drop Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadAndInsertImage(file, "content_en");
                  }}
                />
              </label>
            </div>

            {/* Quick Image Insertion Bar */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-gray-950/80 border border-gray-800 rounded-lg mb-2 text-xs">
              <span className="font-semibold text-gray-400 flex items-center gap-1">
                <span>🖼️</span> Quick Visuals:
              </span>

              {/* Cover Pill */}
              <button
                type="button"
                onClick={() => insertCoverIntoContent("en")}
                className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                  form.cover_image_url
                    ? "bg-indigo-950/70 border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/80 cursor-pointer"
                    : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                }`}
                title={form.cover_image_url ? "Insert Cover image at top" : "No cover image uploaded yet"}
              >
                <span className={`w-2 h-2 rounded-full ${form.cover_image_url ? "bg-emerald-400" : "bg-gray-600"}`} />
                <span>Cover Image</span>
              </button>

              {/* Image 1 Pill */}
              {contentImages.find((i) => i.id === "img-1") && (
                <button
                  type="button"
                  onClick={() => {
                    const img1 = contentImages.find((i) => i.id === "img-1");
                    if (img1) insertImageIntoContent(img1, "en");
                  }}
                  className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                    contentImages.find((i) => i.id === "img-1")?.url
                      ? "bg-purple-950/70 border-purple-700/60 text-purple-200 hover:bg-purple-900/80 cursor-pointer"
                      : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                  }`}
                  title={contentImages.find((i) => i.id === "img-1")?.url ? "Insert Image 1 into English" : "Image 1 not uploaded yet"}
                >
                  <span className={`w-2 h-2 rounded-full ${contentImages.find((i) => i.id === "img-1")?.url ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span>Image 1 (img-1)</span>
                </button>
              )}

              {/* Image 2 Pill */}
              {contentImages.find((i) => i.id === "img-2") && (
                <button
                  type="button"
                  onClick={() => {
                    const img2 = contentImages.find((i) => i.id === "img-2");
                    if (img2) insertImageIntoContent(img2, "en");
                  }}
                  className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                    contentImages.find((i) => i.id === "img-2")?.url
                      ? "bg-purple-950/70 border-purple-700/60 text-purple-200 hover:bg-purple-900/80 cursor-pointer"
                      : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                  }`}
                  title={contentImages.find((i) => i.id === "img-2")?.url ? "Insert Image 2 into English" : "Image 2 not uploaded yet"}
                >
                  <span className={`w-2 h-2 rounded-full ${contentImages.find((i) => i.id === "img-2")?.url ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span>Image 2 (img-2)</span>
                </button>
              )}

              {/* Image 3 Pill if exists */}
              {contentImages.find((i) => i.id === "img-3") && (
                <button
                  type="button"
                  onClick={() => {
                    const img3 = contentImages.find((i) => i.id === "img-3");
                    if (img3) insertImageIntoContent(img3, "en");
                  }}
                  className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                    contentImages.find((i) => i.id === "img-3")?.url
                      ? "bg-purple-950/70 border-purple-700/60 text-purple-200 hover:bg-purple-900/80 cursor-pointer"
                      : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${contentImages.find((i) => i.id === "img-3")?.url ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span>Image 3 (img-3)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium ml-auto"
              >
                Visual Studio →
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-2">💡 Tip: Paste screenshots (Ctrl+V) or drag & drop images directly here!</p>
            <MDEditor
              value={form.content_en}
              onChange={(val) => setForm({ ...form, content_en: val ?? "" })}
              height={500}
              preview="live"
            />
          </div>
        </div>
      )}

      {/* ── Bangla Tab ── */}
      {activeTab === "bangla" && (
        <div className="space-y-5">
          {/* Quick Auto-Translate Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 rounded-xl p-4">
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🌐</span> Auto-Translate from English
              </p>
              <p className="text-xs text-blue-300/80 mt-0.5">
                Automatically translates your English Title, Excerpt, and Content into natural Bengali with 1 click.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || !form.title_en.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-600/30 flex items-center gap-2 shrink-0 disabled:opacity-50 active:scale-95"
            >
              {translating ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <span>🌐 Auto-Translate to Bengali</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-400 text-xs">
            💡 বাংলা content না থাকলেও চলবে। English version-ই default হিসেবে দেখাবে।
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">শিরোনাম (বাংলা)</label>
            <input
              type="text"
              value={form.title_bn}
              onChange={(e) => setForm({ ...form, title_bn: e.target.value })}
              placeholder="আমার প্রথম Laravel টিউটোরিয়াল"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-lg font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">সারসংক্ষেপ (বাংলা)</label>
            <textarea
              value={form.excerpt_bn}
              onChange={(e) => setForm({ ...form, excerpt_bn: e.target.value })}
              placeholder="এই পোস্টের সংক্ষিপ্ত বিবরণ..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          <div
            data-color-mode="dark"
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (items) {
                for (let i = 0; i < items.length; i++) {
                  if (items[i].type.startsWith("image/")) {
                    const file = items[i].getAsFile();
                    if (file) {
                      e.preventDefault();
                      handleUploadAndInsertImage(file, "content_bn");
                      break;
                    }
                  }
                }
              }
            }}
            onDrop={(e) => {
              const files = e.dataTransfer?.files;
              if (files && files.length > 0 && files[0].type.startsWith("image/")) {
                e.preventDefault();
                handleUploadAndInsertImage(files[0], "content_bn");
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                বিষয়বস্তু (বাংলা — Markdown)
              </label>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-indigo-300 rounded-lg border border-gray-700 transition">
                <span>📷 ছবি আপলোড</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadAndInsertImage(file, "content_bn");
                  }}
                />
              </label>
            </div>

            {/* Quick Image Insertion Bar (Bangla) */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-gray-950/80 border border-gray-800 rounded-lg mb-2 text-xs">
              <span className="font-semibold text-gray-400 flex items-center gap-1">
                <span>🖼️</span> ভিজ্যুয়াল ইনসার্ট:
              </span>

              {/* Cover Pill */}
              <button
                type="button"
                onClick={() => insertCoverIntoContent("bn")}
                className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                  form.cover_image_url
                    ? "bg-indigo-950/70 border-indigo-700/60 text-indigo-200 hover:bg-indigo-900/80 cursor-pointer"
                    : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                }`}
                title={form.cover_image_url ? "বাংলা আর্টিকেলের শীর্ষে কভার ইমেজ যুক্ত করুন" : "কভার ইমেজ আপলোড করা হয়নি"}
              >
                <span className={`w-2 h-2 rounded-full ${form.cover_image_url ? "bg-emerald-400" : "bg-gray-600"}`} />
                <span>কভার ইমেজ</span>
              </button>

              {/* Image 1 Pill */}
              {contentImages.find((i) => i.id === "img-1") && (
                <button
                  type="button"
                  onClick={() => {
                    const img1 = contentImages.find((i) => i.id === "img-1");
                    if (img1) insertImageIntoContent(img1, "bn");
                  }}
                  className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                    contentImages.find((i) => i.id === "img-1")?.url
                      ? "bg-emerald-950/70 border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/80 cursor-pointer"
                      : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                  }`}
                  title={contentImages.find((i) => i.id === "img-1")?.url ? "বাংলা আর্টিকেলে ইমেজ ১ বসান" : "ইমেজ ১ তৈরি বা আপলোড করা হয়নি"}
                >
                  <span className={`w-2 h-2 rounded-full ${contentImages.find((i) => i.id === "img-1")?.url ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span>ইমেজ ১ (img-1)</span>
                </button>
              )}

              {/* Image 2 Pill */}
              {contentImages.find((i) => i.id === "img-2") && (
                <button
                  type="button"
                  onClick={() => {
                    const img2 = contentImages.find((i) => i.id === "img-2");
                    if (img2) insertImageIntoContent(img2, "bn");
                  }}
                  className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                    contentImages.find((i) => i.id === "img-2")?.url
                      ? "bg-emerald-950/70 border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/80 cursor-pointer"
                      : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                  }`}
                  title={contentImages.find((i) => i.id === "img-2")?.url ? "বাংলা আর্টিকেলে ইমেজ ২ বসান" : "ইমেজ ২ তৈরি বা আপলোড করা হয়নি"}
                >
                  <span className={`w-2 h-2 rounded-full ${contentImages.find((i) => i.id === "img-2")?.url ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span>ইমেজ ২ (img-2)</span>
                </button>
              )}

              {/* Image 3 Pill if exists */}
              {contentImages.find((i) => i.id === "img-3") && (
                <button
                  type="button"
                  onClick={() => {
                    const img3 = contentImages.find((i) => i.id === "img-3");
                    if (img3) insertImageIntoContent(img3, "bn");
                  }}
                  className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                    contentImages.find((i) => i.id === "img-3")?.url
                      ? "bg-emerald-950/70 border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/80 cursor-pointer"
                      : "bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-60"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${contentImages.find((i) => i.id === "img-3")?.url ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span>ইমেজ ৩ (img-3)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium ml-auto"
              >
                ভিজ্যুয়াল স্টুডিও →
              </button>
            </div>

            <MDEditor
              value={form.content_bn}
              onChange={(val) => setForm({ ...form, content_bn: val ?? "" })}
              height={500}
              preview="live"
            />
          </div>
        </div>
      )}

      {/* ── AI Assistant Tab ── */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          
          {/* Quota Dashboard */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚡ AI API Quota Status</span>
                </h3>
                <p className="text-sm text-gray-400 mt-1">Real-time status of your AI API providers.</p>
              </div>
              <div className="flex gap-2">
                <select
                  value={preferredProvider}
                  onChange={(e) => setPreferredProvider(e.target.value)}
                  className="text-xs bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-lg text-white px-2 py-1.5 transition-colors focus:outline-none"
                >
                  <option value="auto">🤖 Auto-Routing (Smart Fallback)</option>
                  <option value="openrouter">🌐 OpenRouter (Llama 3)</option>
                  <option value="gemini">✨ Gemini (Flash/Lite)</option>
                  <option value="groq">⚡ Groq (Llama 3 8B)</option>
                </select>
                <button 
                  onClick={fetchQuotas} 
                  disabled={loadingQuotas}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg text-white transition-colors"
                >
                  {loadingQuotas ? "Refreshing..." : "🔄 Refresh"}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quotas.map((q, idx) => (
                <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700/50 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${q.isConfigured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
                    <span className="font-semibold text-gray-200">{q.provider}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">Status: {q.isConfigured ? '✅ Configured' : '❌ Missing Key'}</div>
                  {q.isConfigured && (
                    <>
                      <div className="text-xs font-medium text-emerald-400 mt-2">Limit: {q.limitInfo}</div>
                      <div className="text-xs text-gray-500 mt-1">Usage: {q.usageInfo}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action 1: Translation */}
          <div className="flex items-center justify-between bg-blue-900/20 border border-blue-800/50 p-4 rounded-xl">
            <div>
              <h4 className="text-sm font-semibold text-blue-300">
                Auto Translate to Bengali
                {completedTasks.translate && <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800/50">✅ Completed</span>}
              </h4>
              <p className="text-xs text-blue-400/80 mt-1">Uses AI to translate your English Title, Excerpt, and Content perfectly into Bengali.</p>
            </div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {translating ? "Translating..." : "🌐 Translate to Bengali"}
            </button>
          </div>

          {/* Action 2: Excerpts & Tags */}
          <div className="flex items-center justify-between bg-purple-900/20 border border-purple-800/50 p-4 rounded-xl">
            <div>
              <h4 className="text-sm font-semibold text-purple-300">
                Generate Excerpts & Tags
                {completedTasks.meta && <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800/50">✅ Completed</span>}
              </h4>
              <p className="text-xs text-purple-400/80 mt-1">Reads your English content and generates engaging excerpts for both languages, plus suggests tags.</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateMeta}
              disabled={generatingMeta}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {generatingMeta ? "Generating..." : "🏷️ Generate Excerpts & Tags"}
            </button>
          </div>

          {/* Action 3: SEO */}
          <div className="flex items-center justify-between bg-indigo-900/20 border border-indigo-800/50 p-4 rounded-xl">
            <div>
              <h4 className="text-sm font-semibold text-indigo-300">
                AI SEO Generator
                {completedTasks.seo && <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800/50">✅ Completed</span>}
              </h4>
              <p className="text-xs text-indigo-400/80 mt-1">Automatically write English & Bengali SEO titles and meta descriptions.</p>
            </div>
            <button
              type="button"
              onClick={handleGenerateSEO}
              disabled={generatingSEO}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {generatingSEO ? "Generating..." : "✨ Auto Generate SEO"}
            </button>
          </div>
          
          {/* Action 4: Image Generation */}
          <div className="flex flex-col gap-4 bg-teal-900/20 border border-teal-800/50 p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
                  <span>🎨 Generate Thumbnail / Cover Image (16:9 Widescreen)</span>
                  {completedTasks.image && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      ✅ Completed
                    </span>
                  )}
                </h4>
                <p className="text-xs text-teal-400/80 mt-1">
                  AI analyzes your post&apos;s title, tech stack, and content to create a topic-specific 16:9 cover image with no text.
                </p>
              </div>

              {/* Style / Theme Preset Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-teal-300/80 whitespace-nowrap">Theme Style:</span>
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-900 border border-teal-700/60 rounded-lg text-teal-200 text-xs focus:outline-none focus:border-teal-400"
                >
                  <option value="auto">🎯 Topic-Adaptive (Recommended)</option>
                  <option value="isometric">📐 3D Isometric Tech Art</option>
                  <option value="cybernetic">🌌 Cybernetic Neon & Matrix</option>
                  <option value="glassmorphism">🎨 Minimalist Glassmorphic UI</option>
                  <option value="photorealistic">📸 Photorealistic Studio Tech</option>
                  <option value="illustration">🖌️ Modern Digital Tech Illustration</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Click 'Generate Prompt' to analyze this post and craft a focused prompt..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={handleGenerateImagePrompt}
                disabled={generatingImagePrompt || (!form.title_en && !form.content_en)}
                className="px-3.5 py-2 bg-teal-800/60 hover:bg-teal-700/80 text-teal-100 border border-teal-600/60 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                title="AI analyzes your post topic, category, tags, and theme to generate a tailored visual prompt"
              >
                <span>{generatingImagePrompt ? "Analyzing..." : "💡 Generate Prompt"}</span>
              </button>
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="Flux Pro (1280x720)">Flux Pro (16:9 HD)</option>
                <option value="Pollinations High-Res">Pollinations (1280x720)</option>
              </select>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={generatingImage || (!form.content_en && !imagePrompt)}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-sm font-semibold rounded-lg transition-all whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-teal-900/30"
              >
                <span>{generatingImage ? "Generating..." : "🎨 Generate Image"}</span>
              </button>
            </div>

            {/* Post-Tailored Visual Metadata Banner */}
            {promptMeta && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-teal-950/60 border border-teal-800/60 rounded-lg text-xs animate-in fade-in duration-300">
                {promptMeta.theme && (
                  <span className="bg-teal-900/70 text-teal-200 px-2.5 py-1 rounded-md border border-teal-700/60 font-medium flex items-center gap-1">
                    <span>🎯</span> <strong>Theme:</strong> {promptMeta.theme}
                  </span>
                )}
                {promptMeta.color_palette && (
                  <span className="bg-cyan-900/70 text-cyan-200 px-2.5 py-1 rounded-md border border-cyan-700/60 font-medium flex items-center gap-1">
                    <span>🎨</span> <strong>Palette:</strong> {promptMeta.color_palette}
                  </span>
                )}
                {promptMeta.concept && (
                  <span className="text-teal-300/90 italic flex-1 min-w-[220px]">
                    💡 {promptMeta.concept}
                  </span>
                )}
                <span className="text-[11px] text-teal-400/80 ml-auto font-mono bg-black/40 px-2 py-0.5 rounded border border-teal-800/40">
                  📐 16:9 (1280x720) • No Text
                </span>
              </div>
            )}
            {/* Cover Image Preview & Dedicated Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-teal-950/40 border border-teal-800/40 rounded-lg">
              <div className="flex items-center gap-3">
                {form.cover_image_url ? (
                  <div className="relative w-28 h-16 rounded-md overflow-hidden border border-teal-700/60 bg-black shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
                    <a
                      href={form.cover_image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/80 text-white px-1 py-0.2 rounded font-mono"
                    >
                      ↗
                    </a>
                  </div>
                ) : (
                  <div className="w-28 h-16 rounded-md border border-dashed border-teal-800/60 bg-teal-950/20 flex flex-col items-center justify-center text-[10px] text-teal-400 shrink-0">
                    <span>🖼️ No Cover</span>
                  </div>
                )}
                <div>
                  <span className="text-xs font-semibold text-teal-200 block">Dedicated Cover / Thumbnail</span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {form.cover_image_url ? form.cover_image_url.slice(0, 45) + "..." : "Upload or generate AI cover"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 bg-teal-800/70 hover:bg-teal-700 text-teal-100 text-xs font-semibold rounded-lg border border-teal-600/50 flex items-center gap-1.5 transition shadow-sm">
                  <span>📁 Direct Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCoverImage(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => insertCoverIntoContent("en")}
                  disabled={!form.cover_image_url}
                  className="px-2.5 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-700/60 text-xs font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>🇬🇧 Insert in EN Top</span>
                </button>

                <button
                  type="button"
                  onClick={() => insertCoverIntoContent("bn")}
                  disabled={!form.cover_image_url}
                  className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 text-xs font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>🇧🇩 Insert in BN Top</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Content Images (Multi-visual diagrams & flowcharts) */}
          <div className="flex flex-col gap-4 bg-gradient-to-b from-indigo-950/30 to-purple-950/20 border border-indigo-800/40 p-4 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🖼️</span>
                  <h4 className="text-sm font-bold text-indigo-200">
                    Dedicated Article Visuals &amp; Diagrams
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                    {contentImages.length} Visual{contentImages.length !== 1 ? "s" : ""}
                  </span>
                  {contentImages.some((img) => img.url) && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                      {contentImages.filter((img) => img.url).length} Ready
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-300/80 mt-1">
                  Dedicated slots for <code className="text-indigo-200 bg-black/40 px-1 py-0.5 rounded">img-1</code>, <code className="text-indigo-200 bg-black/40 px-1 py-0.5 rounded">img-2</code>, etc. with 1-click upload, AI generation, and insertion into English &amp; বাংলা articles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextNum = contentImages.length + 1;
                    const newId = `img-${nextNum}`;
                    const newSlot: ContentImage = {
                      id: newId,
                      placement_marker: `{{IMAGE:${newId}}}`,
                      prompt: "",
                      alt_en: "",
                      alt_bn: "",
                      caption_en: "",
                      caption_bn: "",
                      url: null,
                      status: "pending",
                    };
                    const updated = [...contentImages, newSlot];
                    setContentImages(updated);
                    saveImagesToStorage(updated);
                    toast.success(`Added dedicated slot ${newId}!`);
                  }}
                  className="px-2.5 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/60 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Add another dedicated visual slot (e.g. img-3)"
                >
                  <span>+ Add Image Slot</span>
                </button>

                <button
                  type="button"
                  onClick={handleDetectImageMarkersFromContent}
                  className="px-2.5 py-1.5 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  title="Scan article content for {{IMAGE:img-N}} markers and add to this list"
                >
                  <span>🔍 Scan Markers</span>
                </button>

                {contentImages.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleGenerateAllContentImages}
                      disabled={generatingAllContentImages || contentImages.every((img) => img.url)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                      title="Generate all pending visuals sequentially"
                    >
                      <span>{generatingAllContentImages ? "Generating All..." : "⚡ Generate All"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReplaceImageMarkers()}
                      disabled={!contentImages.some((img) => img.url)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                      title="Insert or replace all visuals into both English and Bangla content"
                    >
                      <span>🔄 Insert All in Content</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* List of Content Images */}
            {contentImages.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-lg border border-dashed border-indigo-800/40 bg-black/20">
                <p className="text-xs text-gray-400">
                  No content diagrams configured yet. Click{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setContentImages(defaultContentImages);
                      saveImagesToStorage(defaultContentImages);
                    }}
                    className="text-indigo-400 hover:underline font-medium"
                  >
                    Reset Default Slots (img-1, img-2)
                  </button>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contentImages.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="p-4 bg-gray-900/90 border border-gray-800 rounded-xl flex flex-col md:flex-row gap-4 items-start relative group hover:border-indigo-700/50 transition-colors shadow-sm"
                  >
                    {/* Left: Preview, Direct Upload, AI Generate, and Insert Buttons */}
                    <div className="w-full md:w-48 shrink-0">
                      {img.url ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700 bg-black shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.alt_en || img.id}
                            className="w-full h-full object-cover"
                          />
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-1 right-1 text-[10px] bg-black/80 hover:bg-black text-white px-1.5 py-0.5 rounded font-mono"
                          >
                            Open ↗
                          </a>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border border-dashed border-indigo-900/60 bg-indigo-950/20 flex flex-col items-center justify-center p-2 text-center text-xs text-indigo-400">
                          <span className="text-xl mb-0.5">🖼️</span>
                          <span className="font-mono text-xs font-bold text-indigo-300">
                            {img.id === "img-1" ? "Image 1" : img.id === "img-2" ? "Image 2" : img.id}
                          </span>
                          <span className="text-[10px] text-gray-400">16:9 • No Text</span>
                        </div>
                      )}

                      <div className="mt-2.5 flex flex-col gap-1.5">
                        {/* Direct File Upload button */}
                        <label className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                          <span>📁 Direct Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadContentImage(file, img.id);
                            }}
                          />
                        </label>

                        {/* AI Generate button */}
                        <button
                          type="button"
                          onClick={() => handleGenerateContentImage(img)}
                          disabled={generatingContentImageId === img.id || generatingAllContentImages}
                          className="w-full py-1.5 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                        >
                          {generatingContentImageId === img.id ? (
                            <span>Generating...</span>
                          ) : (
                            <span>{img.url ? "🎨 Re-Generate AI" : "🎨 AI Generate"}</span>
                          )}
                        </button>

                        {/* Dedicated Insert into English button */}
                        <button
                          type="button"
                          onClick={() => insertImageIntoContent(img, "en")}
                          disabled={!img.url}
                          className="w-full py-1.5 px-2 bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 border border-blue-700/60 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Insert or replace into English article markdown"
                        >
                          <span>🇬🇧 Insert into English</span>
                        </button>

                        {/* Dedicated Insert into Bangla button */}
                        <button
                          type="button"
                          onClick={() => insertImageIntoContent(img, "bn")}
                          disabled={!img.url}
                          className="w-full py-1.5 px-2 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Insert or replace into Bangla article markdown"
                        >
                          <span>🇧🇩 Insert into বাংলা</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Details & Editable fields */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-700/60">
                            {img.id === "img-1"
                              ? "⭐ Dedicated Slot 1 (Image 1)"
                              : img.id === "img-2"
                              ? "⭐ Dedicated Slot 2 (Image 2)"
                              : `🖼️ Dedicated Slot (${img.id})`}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            Marker: <code className="text-indigo-300 font-semibold">{img.placement_marker || `{{IMAGE:${img.id}}}`}</code>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-mono">
                            Naming: <span className="text-gray-300 font-semibold">{form.slug || "slug"}-{img.id}.png</span>
                          </span>

                          {idx >= 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = contentImages.filter((item) => item.id !== img.id);
                                setContentImages(updated);
                                saveImagesToStorage(updated);
                              }}
                              className="text-gray-500 hover:text-red-400 text-xs transition-colors p-1"
                              title="Remove this extra slot"
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Prompt */}
                      <div>
                        <label className="block text-[11px] font-medium text-gray-400 mb-1">
                          Visual Prompt (Glassmorphism / Cyan-Purple Style):
                        </label>
                        <textarea
                          value={img.prompt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContentImages((prev) =>
                              prev.map((item) => (item.id === img.id ? { ...item, prompt: val } : item))
                            );
                          }}
                          rows={2}
                          placeholder="Detailed prompt for diagram generation..."
                          className="w-full px-3 py-1.5 bg-black/40 border border-gray-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>

                      {/* Bilingual Alt & Captions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-400 mb-0.5">
                            Alt Text (English)
                          </label>
                          <input
                            type="text"
                            value={img.alt_en}
                            onChange={(e) => {
                              const val = e.target.value;
                              setContentImages((prev) =>
                                prev.map((item) => (item.id === img.id ? { ...item, alt_en: val } : item))
                              );
                            }}
                            placeholder="Diagram explaining flow..."
                            className="w-full px-2.5 py-1 bg-black/40 border border-gray-800 rounded text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-medium text-gray-400 mb-0.5">
                            Alt Text (বাংলা)
                          </label>
                          <input
                            type="text"
                            value={img.alt_bn}
                            onChange={(e) => {
                              const val = e.target.value;
                              setContentImages((prev) =>
                                prev.map((item) => (item.id === img.id ? { ...item, alt_bn: val } : item))
                              );
                            }}
                            placeholder="ডায়াগ্রামের বাংলা বিবরণ..."
                            className="w-full px-2.5 py-1 bg-black/40 border border-gray-800 rounded text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* URL input if manual link / Cloudinary */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="url"
                          value={img.url || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setContentImages((prev) =>
                              prev.map((item) => (item.id === img.id ? { ...item, url: val || null, status: val ? "completed" : "pending" } : item))
                            );
                          }}
                          placeholder="Image URL (auto-filled on generation or paste Cloudinary URL)..."
                          className="flex-1 px-2.5 py-1 bg-black/40 border border-gray-800 rounded text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Action 5: Auto Post Generation */}
          <div className="flex flex-col gap-4 bg-emerald-900/20 border border-emerald-800/50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">
                  AI Auto Post Generator
                  {completedTasks.post && <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800/50">✅ Completed</span>}
                </h4>
                <p className="text-xs text-emerald-400/80 mt-1">Write a complete, human-like, SEO-optimized post about any topic.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={postTopic}
                onChange={(e) => setPostTopic(e.target.value)}
                placeholder="Topic (e.g., Next.js 15 Server Actions)..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleGeneratePost}
                disabled={generatingPost}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {generatingPost ? "Generating..." : "✍️ Generate Full Post"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SEO Title (English)
                <span className="ml-2 text-xs text-gray-500">{form.seo_title_en.length}/60</span>
              </label>
              <input
                type="text"
                value={form.seo_title_en}
                onChange={(e) => setForm({ ...form, seo_title_en: e.target.value })}
                placeholder={form.title_en || "SEO title..."}
                maxLength={60}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description (English)
                <span className="ml-2 text-xs text-gray-500">{form.meta_desc_en.length}/160</span>
              </label>
              <textarea
                value={form.meta_desc_en}
                onChange={(e) => setForm({ ...form, meta_desc_en: e.target.value })}
                placeholder="Compelling description for search results..."
                maxLength={160}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SEO Title (বাংলা)
              </label>
              <input
                type="text"
                value={form.seo_title_bn}
                onChange={(e) => setForm({ ...form, seo_title_bn: e.target.value })}
                placeholder="বাংলা SEO শিরোনাম..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description (বাংলা)
              </label>
              <textarea
                value={form.meta_desc_bn}
                onChange={(e) => setForm({ ...form, meta_desc_bn: e.target.value })}
                placeholder="বাংলা meta description..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                  placeholder="https://... (Cloudinary URL)"
                  className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                />
                <CldUploadWidget
                  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_preset"}
                  onSuccess={(result: any) => {
                    if (result.info && result.info.secure_url) {
                      setForm({ ...form, cover_image_url: result.info.secure_url });
                    }
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Upload
                    </button>
                  )}
                </CldUploadWidget>
              </div>
              {form.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.cover_image_url} alt="Cover preview" className="mt-3 h-32 w-auto rounded-lg object-cover" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── JSON Import Tab ── */}
      {activeTab === "json" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-gray-900 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span>📥 Auto-Fill Blog Post from JSON</span>
                  <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-normal">
                    One-Click Auto Fill
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Paste your structured blog JSON below. It will automatically populate the English title & article, Bangla title & article, slug, excerpts, SEO meta tags, AI image prompt, and matching tags.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        handleJsonInputChange(text);
                        toast.success("📋 Pasted from clipboard!");
                      }
                    } catch {
                      toast.error("Clipboard permission denied. Please paste manually (Ctrl+V).");
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition flex items-center gap-1.5"
                >
                  📋 Paste
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleJsonInputChange(EXAMPLE_JSON_STRUCTURE);
                    toast.success("✨ Sample JSON template loaded!");
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded-lg border border-gray-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  ✨ Load Template
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(EXAMPLE_JSON_STRUCTURE);
                      toast.success("📋 Updated JSON format copied to clipboard!");
                    } catch {
                      toast.error("Failed to copy to clipboard.");
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-purple-300 rounded-lg border border-gray-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  📋 Copy Template
                </button>
                {jsonInput && (
                  <button
                    type="button"
                    onClick={() => handleJsonInputChange("")}
                    className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-red-400 rounded-lg border border-gray-700 transition flex items-center gap-1.5"
                  >
                    🧹 Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <span>JSON Input Box</span>
                {parsedJsonData && (
                  <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    ✓ Valid JSON
                  </span>
                )}
                {jsonError && (
                  <span className="text-red-400 font-mono text-[11px] bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded">
                    ⚠ {jsonError}
                  </span>
                )}
              </label>
              <span className="text-gray-500">
                {jsonInput.length > 0 ? `${jsonInput.length} characters` : "Waiting for JSON..."}
              </span>
            </div>

            <div className="relative">
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonInputChange(e.target.value)}
                placeholder={EXAMPLE_JSON_STRUCTURE}
                rows={16}
                className={`w-full px-4 py-3 bg-gray-950 border rounded-xl text-gray-100 font-mono text-xs leading-relaxed placeholder-gray-600 focus:outline-none focus:ring-1 resize-y transition ${
                  jsonError
                    ? "border-red-500/50 focus:ring-red-500"
                    : parsedJsonData
                    ? "border-emerald-500/50 focus:ring-emerald-500"
                    : "border-gray-800 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
            </div>
          </div>

          {/* Real-time Field Detection Card */}
          {parsedJsonData && (
            <div className="bg-gray-900/90 border border-gray-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Detected Fields in JSON
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.slug || parsedJsonData.blog_url
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🔗 Slug</span>
                  <span>{parsedJsonData.slug ? "✓" : parsedJsonData.blog_url ? "from URL" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.english?.title && parsedJsonData.english?.article
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🇬🇧 English Post</span>
                  <span>{parsedJsonData.english?.title ? "✓ Ready" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.bangla?.title && parsedJsonData.bangla?.article
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🇧🇩 বাংলা পোস্ট</span>
                  <span>{parsedJsonData.bangla?.title ? "✓ Ready" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.excerpt?.english || parsedJsonData.excerpt?.bangla
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>📝 Excerpts</span>
                  <span>{parsedJsonData.excerpt ? "✓ Ready" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.seo?.meta_description_en || parsedJsonData.seo?.seo_title_en
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🔍 SEO & Keywords</span>
                  <span>{parsedJsonData.seo?.primary_keyword_bn ? "✓ EN & BN" : parsedJsonData.seo ? "✓ Ready" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.thumbnail?.prompt
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🎨 Image Prompt</span>
                  <span>{parsedJsonData.thumbnail?.prompt ? "✓ Ready" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.social?.linkedin_post || parsedJsonData.social?.devto_article
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>📱 Social Media</span>
                  <span>{parsedJsonData.social ? "✓ Ready" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.canonical_url || parsedJsonData.language_alternate
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🌐 Canonical & hreflang</span>
                  <span>{parsedJsonData.canonical_url ? "✓ Set" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.og_image_bn || parsedJsonData.og_image_en || parsedJsonData.og_image
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🖼️ Dynamic OG Cards</span>
                  <span>{parsedJsonData.og_image_bn ? "✓ EN & BN" : parsedJsonData.og_image_en || parsedJsonData.og_image ? "✓ Set" : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.published_date || parsedJsonData.published_at
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>📅 Published Date</span>
                  <span>{parsedJsonData.published_date || parsedJsonData.published_at || "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.category || (parsedJsonData.tags && parsedJsonData.tags.length > 0)
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>🏷️ Category & Tags</span>
                  <span>{parsedJsonData.category ? "✓ Matched" : parsedJsonData.tags?.length ? `${parsedJsonData.tags.length} Tags` : "—"}</span>
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  Array.isArray(parsedJsonData.faq) && parsedJsonData.faq.length > 0
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>❓ FAQ Schema (GEO)</span>
                  <span>{parsedJsonData.faq?.length ? `✓ ${parsedJsonData.faq.length} Q&As` : "—"}</span>
                </div>

                {(() => {
                  const enWords = parsedJsonData.english?.article
                    ? parsedJsonData.english.article.trim().split(/\s+/).filter(Boolean).length
                    : (parsedJsonData.word_count?.english || 0);
                  const bnWords = parsedJsonData.bangla?.article
                    ? parsedJsonData.bangla.article.trim().split(/\s+/).filter(Boolean).length
                    : (parsedJsonData.word_count?.bangla || 0);
                  const meetsTarget = enWords >= 1200 && bnWords >= 1200;
                  const hasWords = enWords > 0 || bnWords > 0;

                  return (
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      !hasWords
                        ? "bg-gray-800/40 border-gray-700/40 text-gray-500"
                        : meetsTarget
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-950/20 border-amber-500/30 text-amber-300"
                    }`}>
                      <span>📊 Word Count</span>
                      <span className="font-mono text-[11px]">
                        {hasWords
                          ? `${enWords} EN / ${bnWords} BN ${meetsTarget ? "✓ (1.2k+)" : "⚠ (<1.2k)"}`
                          : "—"}
                      </span>
                    </div>
                  );
                })()}

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  parsedJsonData.branding?.angle
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-500"
                }`}>
                  <span>💡 Brand Angle</span>
                  <span>{parsedJsonData.branding?.angle ? "✓ Ready" : "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => applyJsonToForm()}
              disabled={!jsonInput.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>🚀 Auto-Fill Form from JSON</span>
            </button>
            <p className="text-xs text-gray-400">
              Clicking will automatically populate English, Bangla, SEO, Excerpts, Slug, and AI cover prompt, then redirect you to review in the English tab.
            </p>
          </div>

          {/* Social Syndication Companion Card (LinkedIn & Dev.to) */}
          {(socialData || parsedJsonData?.social) && (() => {
            const activeSocial = socialData || parsedJsonData?.social;
            const linkedInPostEn = activeSocial?.linkedin_post_en || activeSocial?.linkedin_post;
            const linkedInTagsEn = Array.isArray(activeSocial?.linkedin_hashtags_en)
              ? activeSocial.linkedin_hashtags_en
              : Array.isArray(activeSocial?.linkedin_hashtags)
              ? activeSocial.linkedin_hashtags
              : [];
            const linkedInPostBn = activeSocial?.linkedin_post_bn;
            const linkedInTagsBn = Array.isArray(activeSocial?.linkedin_hashtags_bn)
              ? activeSocial.linkedin_hashtags_bn
              : [];
            const devtoArticle = activeSocial?.devto_article;
            const devtoTitle = activeSocial?.devto_title;
            const devtoTags = Array.isArray(activeSocial?.devto_tags) ? activeSocial.devto_tags : [];

            return (
              <div className="mt-8 border border-gray-800 bg-gray-900/60 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📱 Social Media & Cross-Posting Content</span>
                    <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                      Ready to Copy
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Pre-formatted social media posts from your JSON or AI generator:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* LinkedIn English Box */}
                  {linkedInPostEn && (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          LinkedIn (English)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const hashtags = linkedInTagsEn.length > 0 ? "\n\n" + linkedInTagsEn.join(" ") : "";
                            navigator.clipboard.writeText(linkedInPostEn + hashtags);
                            toast.success("📋 Copied English LinkedIn post!");
                          }}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-blue-300 rounded border border-gray-700 transition cursor-pointer"
                        >
                          Copy EN
                        </button>
                      </div>
                      <p className="text-xs text-gray-300 whitespace-pre-wrap font-sans bg-gray-900/50 p-3 rounded-lg max-h-48 overflow-y-auto">
                        {linkedInPostEn}
                        {linkedInTagsEn.length > 0 && (
                          <span className="block mt-2 text-blue-400 font-medium">
                            {linkedInTagsEn.join(" ")}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* LinkedIn Bengali Box */}
                  {linkedInPostBn && (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                          LinkedIn (বাংলা)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const hashtags = linkedInTagsBn.length > 0 ? "\n\n" + linkedInTagsBn.join(" ") : "";
                            navigator.clipboard.writeText(linkedInPostBn + hashtags);
                            toast.success("📋 Copied Bengali LinkedIn post!");
                          }}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-emerald-300 rounded border border-gray-700 transition cursor-pointer"
                        >
                          Copy BN
                        </button>
                      </div>
                      <p className="text-xs text-gray-300 whitespace-pre-wrap font-sans bg-gray-900/50 p-3 rounded-lg max-h-48 overflow-y-auto">
                        {linkedInPostBn}
                        {linkedInTagsBn.length > 0 && (
                          <span className="block mt-2 text-emerald-400 font-medium">
                            {linkedInTagsBn.join(" ")}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* DEV.to Box */}
                  {devtoArticle && (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                          <span className="font-bold border border-gray-600 px-1 py-0.2 rounded text-[10px]">DEV</span>
                          DEV.to Article
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const tagsHeader = devtoTags.length > 0 ? `Tags: ${devtoTags.join(", ")}\n\n` : "";
                            const titleHeader = devtoTitle ? `# ${devtoTitle}\n\n` : "";
                            navigator.clipboard.writeText(titleHeader + tagsHeader + devtoArticle);
                            toast.success("📋 Copied DEV.to article!");
                          }}
                          className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded border border-gray-700 transition cursor-pointer"
                        >
                          Copy Article
                        </button>
                      </div>
                      <div className="text-xs text-gray-300 bg-gray-900/50 p-3 rounded-lg max-h-48 overflow-y-auto space-y-2 font-mono">
                        {devtoTitle && (
                          <p className="font-bold text-white font-sans">{devtoTitle}</p>
                        )}
                        <p className="whitespace-pre-wrap">{devtoArticle.slice(0, 300)}...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── DEV.to 1-Click Cross-Posting Card ── always visible in JSON tab ── */}
          <div className="mt-6 border border-gray-700/80 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0 text-base font-bold text-white">
                  DEV
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">1-Click Post to DEV.to</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Posts as <span className="text-yellow-400 font-medium">Draft</span> with canonical URL pointing to your portfolio — SEO safe.
                    {(socialData?.devto_article || parsedJsonData?.social?.devto_article) && (
                      <span className="ml-1 text-emerald-400">✓ DEV.to article ready</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {crossPostResult.devto ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/40 px-2.5 py-1 rounded-full font-medium">
                      ✅ {crossPostResult.devto.status === "draft" ? "Draft created" : "Published"}
                    </span>
                    <a
                      href={crossPostResult.devto.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-indigo-300 border border-gray-700 px-3 py-1 rounded-lg transition"
                    >
                      Open on DEV.to →
                    </a>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCrossPost}
                    disabled={crossPosting.devto || !form.title_en.trim() || !form.content_en.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-indigo-600/30 text-white border border-gray-600 hover:border-indigo-500/60 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {crossPosting.devto ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Posting…
                      </>
                    ) : (
                      <>
                        <span className="text-base">📤</span> Post to DEV.to
                      </>
                    )}
                  </button>
                )}
                {!form.title_en.trim() && (
                  <p className="text-[11px] text-red-400">Add English title first</p>
                )}
              </div>
            </div>

            {/* Canonical URL preview */}
            {form.slug && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-[11px] text-gray-500">
                  Canonical URL:{" "}
                  <span className="text-indigo-400 font-mono">
                    https://zahidhasantonmoy.vercel.app/blog/{form.slug}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Social Media & Cross-Posting Studio Tab (Always Accessible & Persistent) ── */}
      {activeTab === "social" && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950/40 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  📱
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Social Media &amp; Cross-Posting Studio
                    </h3>
                    <span className="text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                      Permanent &amp; Auto-Saved
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                    Generate high-conversion viral hooks and syndication content for LinkedIn, DEV.to, and Twitter / X. 
                    Everything you see or edit here is permanently preserved in drafts and will not disappear when saving.
                  </p>
                  
                  {/* Status overview badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px]">
                    <span className={`px-2 py-0.5 rounded border font-mono ${
                      socialData?.linkedin_post_en || socialData?.linkedin_post
                        ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-500"
                    }`}>
                      LinkedIn EN: {socialData?.linkedin_post_en || socialData?.linkedin_post ? "✓ Ready" : "Empty"}
                    </span>
                    <span className={`px-2 py-0.5 rounded border font-mono ${
                      socialData?.linkedin_post_bn
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-500"
                    }`}>
                      LinkedIn BN: {socialData?.linkedin_post_bn ? "✓ Ready" : "Empty"}
                    </span>
                    <span className={`px-2 py-0.5 rounded border font-mono ${
                      socialData?.devto_article
                        ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-500"
                    }`}>
                      DEV.to: {socialData?.devto_article ? "✓ Ready" : "Empty"}
                    </span>
                    <span className={`px-2 py-0.5 rounded border font-mono ${
                      socialData?.twitter_post
                        ? "bg-sky-950/40 border-sky-500/40 text-sky-300"
                        : "bg-gray-800/50 border-gray-700/50 text-gray-500"
                    }`}>
                      Twitter/X: {socialData?.twitter_post ? "✓ Ready" : "Empty"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleGenerateSocial}
                  disabled={generatingSocial || !form.title_en.trim() || !form.content_en.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingSocial ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating Social Posts...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Generate Social with AI</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("json")}
                  className="px-3 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 border border-gray-700 text-xs font-medium rounded-xl transition text-center"
                >
                  📥 Import from JSON
                </button>
              </div>
            </div>
          </div>

          {/* Social Platform Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. LinkedIn English Card */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">LinkedIn (English)</h4>
                      <span className="text-[10px] text-gray-400">Viral hook + takeaways + canonical CTA</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const postText = socialData?.linkedin_post_en || socialData?.linkedin_post || "";
                      const tags = socialData?.linkedin_hashtags_en || [];
                      const full = postText + (tags.length > 0 ? "\n\n" + tags.join(" ") : "");
                      if (!full.trim()) {
                        toast.error("LinkedIn English copy is empty.");
                        return;
                      }
                      navigator.clipboard.writeText(full);
                      toast.success("📋 Copied LinkedIn English post!");
                    }}
                    className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-700/50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>📋 Copy EN</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 flex justify-between">
                    <span>Post Content</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {(socialData?.linkedin_post_en || socialData?.linkedin_post || "").length} chars
                    </span>
                  </label>
                  <textarea
                    rows={8}
                    value={socialData?.linkedin_post_en || socialData?.linkedin_post || ""}
                    onChange={(e) => {
                      const updated: SocialData = {
                        ...(socialData || {}),
                        linkedin_post_en: e.target.value,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="Hook: Most engineers struggle with X...\n\nHere are 3 architectural patterns that fix it:\n\n1. Pattern A...\n\nRead the complete article: https://..."
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300 flex justify-between">
                    <span>Hashtags</span>
                    <span className="text-[10px] text-gray-500">Space or comma separated</span>
                  </label>
                  <input
                    type="text"
                    value={(socialData?.linkedin_hashtags_en || []).join(" ")}
                    onChange={(e) => {
                      const tags = e.target.value.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`));
                      const updated: SocialData = {
                        ...(socialData || {}),
                        linkedin_hashtags_en: tags,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="#WebDev #React #SoftwareEngineering #Performance"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-blue-300 font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. LinkedIn Bengali Card */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">LinkedIn (বাংলা)</h4>
                      <span className="text-[10px] text-gray-400">লোকাল কমিউনিটি ও বাংলা পাঠকদের জন্য</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const postText = socialData?.linkedin_post_bn || "";
                      const tags = socialData?.linkedin_hashtags_bn || [];
                      const full = postText + (tags.length > 0 ? "\n\n" + tags.join(" ") : "");
                      if (!full.trim()) {
                        toast.error("LinkedIn বাংলা পোস্ট এখনো খালি।");
                        return;
                      }
                      navigator.clipboard.writeText(full);
                      toast.success("📋 Copied LinkedIn Bengali post!");
                    }}
                    className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>📋 Copy BN</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 flex justify-between">
                    <span>পোস্টের বিষয়বস্তু (Bengali Content)</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {(socialData?.linkedin_post_bn || "").length} chars
                    </span>
                  </label>
                  <textarea
                    rows={8}
                    value={socialData?.linkedin_post_bn || ""}
                    onChange={(e) => {
                      const updated: SocialData = {
                        ...(socialData || {}),
                        linkedin_post_bn: e.target.value,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="🚀 নতুন ব্লগ আর্টিকেলে জেনে নিন কীভাবে...\n\nআজকের আলোচনায় আমরা বিস্তারিত তুলে ধরেছি...\n\n🔗 সম্পূর্ণ আর্টিকেলটি পড়ুন: https://..."
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed resize-y"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300 flex justify-between">
                    <span>বাংলা হ্যাশট্যাগ</span>
                    <span className="text-[10px] text-gray-500">স্পেস দিয়ে আলাদা করুন</span>
                  </label>
                  <input
                    type="text"
                    value={(socialData?.linkedin_hashtags_bn || []).join(" ")}
                    onChange={(e) => {
                      const tags = e.target.value.split(/[\s,]+/).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`));
                      const updated: SocialData = {
                        ...(socialData || {}),
                        linkedin_hashtags_bn: tags,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="#বাংলা #প্রোগ্রামিং #ওয়েবডেভেলপমেন্ট #TechBangladesh"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-emerald-300 font-mono placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Twitter / X Card */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                      𝕏
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Twitter / X Post &amp; Thread</h4>
                      <span className="text-[10px] text-gray-400">Under 280 chars or full thread breakdown</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const tweet = socialData?.twitter_post || "";
                      if (!tweet.trim()) {
                        toast.error("Twitter / X post is empty.");
                        return;
                      }
                      navigator.clipboard.writeText(tweet);
                      toast.success("📋 Copied Twitter post!");
                    }}
                    className="px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-700/50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>📋 Copy Tweet</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-gray-300">Tweet Text</label>
                    {(() => {
                      const len = (socialData?.twitter_post || "").length;
                      const isSingleTweet = len <= 280;
                      return (
                        <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                          len === 0
                            ? "text-gray-500"
                            : isSingleTweet
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                            : "bg-purple-950/40 text-purple-300 border border-purple-500/30"
                        }`}>
                          {len} chars {len > 0 && (isSingleTweet ? "(Single Tweet ✓)" : "(Thread format)")}
                        </span>
                      );
                    })()}
                  </div>
                  <textarea
                    rows={7}
                    value={socialData?.twitter_post || ""}
                    onChange={(e) => {
                      const updated: SocialData = {
                        ...(socialData || {}),
                        twitter_post: e.target.value,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="Most devs don't realize this about system architecture...\n\nHere is how to structure scalable systems 🧵👇"
                    className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-sans leading-relaxed resize-y"
                  />
                </div>
              </div>
            </div>

            {/* 4. DEV.to Article & 1-Click Publishing Card */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-800 text-white flex items-center justify-center font-bold text-[10px] border border-gray-700">
                      DEV
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">DEV.to Syndication</h4>
                      <span className="text-[10px] text-gray-400">Ready formatted with canonical attribution</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const title = socialData?.devto_title || form.title_en;
                      const tags = socialData?.devto_tags || [];
                      const article = socialData?.devto_article || form.content_en;
                      const tagsHeader = tags.length > 0 ? `Tags: ${tags.join(", ")}\n\n` : "";
                      const titleHeader = title ? `# ${title}\n\n` : "";
                      const full = titleHeader + tagsHeader + article;
                      if (!full.trim()) {
                        toast.error("DEV.to content is empty.");
                        return;
                      }
                      navigator.clipboard.writeText(full);
                      toast.success("📋 Copied DEV.to article!");
                    }}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>📋 Copy Article</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300">DEV.to Article Title</label>
                  <input
                    type="text"
                    value={socialData?.devto_title || form.title_en || ""}
                    onChange={(e) => {
                      const updated: SocialData = {
                        ...(socialData || {}),
                        devto_title: e.target.value,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="Engaging article title for DEV.to community"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 flex justify-between">
                    <span>Tags (max 4, lowercase)</span>
                    <span className="text-[10px] text-gray-500">Comma separated</span>
                  </label>
                  <input
                    type="text"
                    value={(socialData?.devto_tags || []).join(", ")}
                    onChange={(e) => {
                      const tags = e.target.value.split(",").map((s) => s.trim().toLowerCase().replace(/^#/, "")).filter(Boolean);
                      const updated: SocialData = {
                        ...(socialData || {}),
                        devto_tags: tags,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="webdev, javascript, react, architecture"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-xs text-indigo-300 font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-300 flex justify-between">
                    <span>DEV Markdown Body</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {(socialData?.devto_article || form.content_en || "").length} chars
                    </span>
                  </label>
                  <textarea
                    rows={6}
                    value={socialData?.devto_article || form.content_en || ""}
                    onChange={(e) => {
                      const updated: SocialData = {
                        ...(socialData || {}),
                        devto_article: e.target.value,
                      };
                      setSocialData(updated);
                      saveSocialToStorage(updated);
                    }}
                    placeholder="DEV.to markdown body..."
                    className="w-full px-3.5 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed resize-y"
                  />
                </div>

                {/* 1-Click Publisher */}
                <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[11px] text-gray-400">
                    {crossPostResult.devto ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        ✓ Published on DEV.to!
                      </span>
                    ) : (
                      <span>Saves as Draft on DEV.to with canonical link</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {crossPostResult.devto && (
                      <a
                        href={crossPostResult.devto.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:underline font-medium"
                      >
                        Open DEV.to →
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleCrossPost}
                      disabled={crossPosting.devto || !form.title_en.trim() || !form.content_en.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {crossPosting.devto ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Publishing…</span>
                        </>
                      ) : (
                        <>
                          <span>📤 1-Click Post to DEV.to</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Publishing Status & Automated Scheduling Manager Card */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm border border-indigo-500/20">
                  ⏰
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Publication &amp; Schedule Controller
                  </h3>
                  <p className="text-xs text-gray-400">
                    Control visibility, immediate publication, or automated future release.
                  </p>
                </div>
              </div>

              {form.status === "scheduled" && form.published_at && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 border border-blue-500/40 text-blue-300">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>Scheduled: {getRelativeTimeMessage(form.published_at)}</span>
                </span>
              )}
            </div>

            {/* Mode Cards: Draft, Publish Now, Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Draft Card */}
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, status: "draft" });
                }}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  form.status === "draft"
                    ? "bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-500/10"
                    : "bg-gray-950/50 border-gray-800 hover:border-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">📄</span>
                  <input
                    type="radio"
                    name="pub_mode"
                    checked={form.status === "draft"}
                    onChange={() => setForm({ ...form, status: "draft" })}
                    className="accent-amber-500 cursor-pointer"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold text-white">Draft Mode</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Private and hidden. Readers and search engines cannot see it.
                  </p>
                </div>
              </button>

              {/* Publish Immediately Card */}
              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    status: "published",
                    published_at: form.published_at && new Date(form.published_at).getTime() <= Date.now()
                      ? form.published_at
                      : formatForDatetimeInput(new Date()),
                  });
                }}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  form.status === "published"
                    ? "bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10"
                    : "bg-gray-950/50 border-gray-800 hover:border-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">⚡</span>
                  <input
                    type="radio"
                    name="pub_mode"
                    checked={form.status === "published"}
                    onChange={() =>
                      setForm({
                        ...form,
                        status: "published",
                        published_at: formatForDatetimeInput(new Date()),
                      })
                    }
                    className="accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold text-white">Publish Live Now</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Immediately live on your blog, feed.xml, and sitemap.
                  </p>
                </div>
              </button>

              {/* Scheduled Publication Card */}
              <button
                type="button"
                onClick={() => {
                  const defaultTarget = form.published_at && new Date(form.published_at).getTime() > Date.now()
                    ? form.published_at
                    : getSchedulePresets()[0].dt;
                  setForm({
                    ...form,
                    status: "scheduled",
                    published_at: defaultTarget,
                  });
                  setScheduleDate(defaultTarget);
                }}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  form.status === "scheduled"
                    ? "bg-blue-950/50 border-blue-500/60 shadow-md shadow-blue-500/10"
                    : "bg-gray-950/50 border-gray-800 hover:border-gray-700 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">⏰</span>
                  <input
                    type="radio"
                    name="pub_mode"
                    checked={form.status === "scheduled"}
                    onChange={() => {
                      const defaultTarget = form.published_at && new Date(form.published_at).getTime() > Date.now()
                        ? form.published_at
                        : getSchedulePresets()[0].dt;
                      setForm({
                        ...form,
                        status: "scheduled",
                        published_at: defaultTarget,
                      });
                    }}
                    className="accent-blue-500 cursor-pointer"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-xs font-bold text-white">Schedule for Later</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Auto-publishes at target future date &amp; time.
                  </p>
                </div>
              </button>
            </div>

            {/* Direct In-Page Schedule Configuration Panel (Active when Scheduled) */}
            {form.status === "scheduled" && (
              <div className="bg-gray-950/70 border border-blue-500/30 rounded-xl p-4 sm:p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <span>📅</span> Pick Future Release Date &amp; Time
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka"}
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Quick Preset Timing:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {getSchedulePresets().map((preset) => {
                      const isSelected = form.published_at === preset.dt;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, published_at: preset.dt });
                            setScheduleDate(preset.dt);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                              : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white"
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct DateTime-Local Input & Quick Adjusters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Custom Exact Datetime:
                    </label>
                    <input
                      type="datetime-local"
                      value={form.published_at || ""}
                      onChange={(e) => {
                        setForm({ ...form, published_at: e.target.value });
                        setScheduleDate(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Fast Hour Adjusters:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "+1 Hour", h: 1 },
                        { label: "+3 Hours", h: 3 },
                        { label: "+1 Day", h: 24 },
                        { label: "+1 Week", h: 168 },
                      ].map((adj) => (
                        <button
                          key={adj.label}
                          type="button"
                          onClick={() => {
                            const newDt = adjustScheduleTime(adj.h, form.published_at);
                            setForm({ ...form, published_at: newDt });
                            setScheduleDate(newDt);
                          }}
                          className="px-2.5 py-2 text-[11px] font-medium bg-gray-900 hover:bg-gray-800 text-blue-300 border border-blue-500/20 rounded-lg transition cursor-pointer"
                        >
                          {adj.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Countdown & Validation Banner */}
                {form.published_at ? (
                  new Date(form.published_at).getTime() > Date.now() ? (
                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 text-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base animate-spin">⏱️</span>
                        <div>
                          <p className="font-semibold text-white">
                            Scheduled to publish {getRelativeTimeMessage(form.published_at)}
                          </p>
                          <p className="text-[11px] text-blue-400/90 font-mono mt-0.5">
                            Target: {new Date(form.published_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at {new Date(form.published_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleUnschedule}
                        className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-[11px] font-medium transition cursor-pointer"
                      >
                        Cancel Schedule
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Selected time is in the past! Please select a future date or click &ldquo;Publish Live Now&rdquo;.</span>
                    </div>
                  )
                ) : (
                  <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 text-xs">
                    Please pick a date and time above to activate scheduled release.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category, Tags & Featured Post */}
          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                  ))}
                </select>
              </div>

              {form.status !== "scheduled" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {form.status === "published" ? "Live Publish Timestamp" : "Creation / Draft Date"}
                  </label>
                  <input
                    type="datetime-local"
                    value={form.published_at || ""}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                      form.tag_ids.includes(tag.id)
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {tag.name_en}
                  </button>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags yet. Add tags from the database.</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="is_featured" className="text-sm text-gray-300 cursor-pointer">
                Featured post (shown prominently on blog listing)
              </label>
            </div>
          </div>
        </div>
      )}


      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-300 transition"
        >
          ← Back
        </button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 text-xs sm:text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => {
              setScheduleDate(form.published_at || "");
              setShowScheduleModal(true);
            }}
            disabled={saving}
            className="px-4 py-2 text-xs sm:text-sm bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 rounded-lg transition disabled:opacity-50 font-medium flex items-center gap-1.5"
          >
            <span>⏰ Schedule</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-5 py-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 font-semibold"
          >
            {saving ? "Saving..." : mode === "edit" ? "Update" : "Publish Now"}
          </button>
        </div>
      </div>

      {/* Google SERP & Social Preview Modal */}
      <SerpPreviewModal
        isOpen={showSerpPreview}
        onClose={() => setShowSerpPreview(false)}
        title={form.title_en}
        seoTitle={form.seo_title_en}
        metaDescription={form.meta_desc_en}
        slug={form.slug}
        coverImage={form.cover_image_url}
        publishDate={form.published_at}
      />

      {/* Schedule Post Modal */}
      {showScheduleModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-base border border-blue-500/20">
                  ⏰
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Schedule Article Publication
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Auto-publishes to blog, sitemap &amp; RSS when this time arrives.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-white text-xs w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                Quick Preset Times:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {getSchedulePresets().map((p) => {
                  const isSelected = scheduleDate === p.dt;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setScheduleDate(p.dt)}
                      className={`px-3 py-2 text-xs rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-blue-600/30 border-blue-500 text-white font-semibold shadow-sm"
                          : "bg-gray-800/60 border-gray-700/60 text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{p.icon}</span>
                        <span className="truncate">{p.label}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{p.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Datetime Input & Hour Adjusters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Exact Datetime Selection:
                </label>
                <span className="text-[10px] text-gray-500 font-mono">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka"}
                </span>
              </div>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: "+1h", h: 1 },
                  { label: "+3h", h: 3 },
                  { label: "+1 Day", h: 24 },
                  { label: "+1 Week", h: 168 },
                ].map((adj) => (
                  <button
                    key={adj.label}
                    type="button"
                    onClick={() => setScheduleDate(adjustScheduleTime(adj.h, scheduleDate))}
                    className="px-2.5 py-1 text-[11px] font-medium bg-gray-800 hover:bg-gray-700 text-blue-300 border border-blue-500/20 rounded-lg transition cursor-pointer"
                  >
                    {adj.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Countdown in Modal */}
            {scheduleDate && (
              <div className={`p-3 rounded-xl border text-xs ${
                new Date(scheduleDate).getTime() > Date.now()
                  ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-300"
              }`}>
                {new Date(scheduleDate).getTime() > Date.now() ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin text-base">⏱️</span>
                    <div>
                      <p className="font-semibold text-white">
                        Will go live {getRelativeTimeMessage(scheduleDate)}
                      </p>
                      <p className="text-[11px] text-blue-400 font-mono mt-0.5">
                        Target: {new Date(scheduleDate).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at {new Date(scheduleDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>⚠️ Selected time is in the past! Please pick a future date &amp; time.</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              {form.status === "scheduled" ? (
                <button
                  type="button"
                  onClick={handleUnschedule}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-500/30 transition cursor-pointer"
                >
                  Unschedule / Revert to Draft
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleScheduleSubmit(scheduleDate)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-600/30 cursor-pointer"
                >
                  Confirm Schedule ⏰
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
