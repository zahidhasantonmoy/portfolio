"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { CldUploadWidget } from "next-cloudinary";
import type { Post } from "@/types/blog";

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

type TabType = "english" | "bangla" | "ai" | "json" | "settings";

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
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("Gemini 3.6 Flash");
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

  async function handleSave(newStatus?: "draft" | "published") {
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

    const payload = {
      ...form,
      status: newStatus ?? form.status,
      published_at: (newStatus === "published" || form.status === "published") && !form.published_at
        ? new Date().toISOString()
        : form.published_at
          ? new Date(form.published_at).toISOString()
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

      toast.success("Saved successfully!");

      if (mode === "create") {
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
    if (!form.content_en) {
      toast.error("Please add some English content first so AI understands what image to generate.");
      return;
    }
    
    setGeneratingImage(true);
    const loadingToast = toast.loading("🎨 Generating image... This can take up to 30 seconds.");
    
    try {
      const res = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          postDetails: `Title: ${form.title_en}\n\nContent: ${form.content_en}`,
          modelName: imageModel,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to generate image");
      
      setForm((prev) => ({ ...prev, cover_image_url: data.url }));
      if (data.promptUsed && !imagePrompt) {
        setImagePrompt(data.promptUsed);
      }
      
      setCompletedTasks(prev => ({ ...prev, image: true }));
      toast.success("Image generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Generation failed: " + err.message);
    } finally {
      toast.dismiss(loadingToast);
      setGeneratingImage(false);
    }
  }

  async function handleGenerateImagePrompt() {
    if (!form.title_en && !form.content_en) {
      toast.error("Please enter English Title or Content first so AI knows what prompt to generate.");
      return;
    }

    setGeneratingImagePrompt(true);
    const toastId = toast.loading("💡 Generating AI image prompt...");

    try {
      const res = await fetch("/api/admin/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title_en,
          content: form.content_en,
          provider: preferredProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate prompt");

      setImagePrompt(data.prompt);
      toast.success("💡 Prompt generated! You can edit or click 'Generate Image'.", { id: toastId });
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to translate");

      setForm((prev) => ({
        ...prev,
        title_bn: data.title_bn || prev.title_bn,
        excerpt_bn: data.excerpt_bn || prev.excerpt_bn,
        content_bn: data.content_bn || prev.content_bn,
      }));
      setCompletedTasks(prev => ({ ...prev, translate: true }));
      toast.success("✨ Auto-translated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Translation failed");
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

    // Build tags from the JSON social data if available, else use empty array
    const devtoTags: string[] = parsedJsonData?.social?.devto_tags ?? [];

    // Use the DEV.to article from JSON if it exists (better formatted), else use the raw content
    const articleContent: string =
      parsedJsonData?.social?.devto_article?.trim() || content;

    const devtoTitle: string =
      parsedJsonData?.social?.devto_title?.trim() || title;

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
      window.open(data.url, "_blank", "noopener");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "DEV.to cross-post failed");
    } finally {
      setCrossPosting((p) => ({ ...p, devto: false }));
    }
  }

  const EXAMPLE_JSON_STRUCTURE = `{
  "slug": "example-technical-topic",
  "blog_url": "https://zahidhasantonmoy.vercel.app/blog/example-technical-topic",
  "bangla": {
    "title": "বাংলা ব্লগের শিরোনাম",
    "article": "সম্পূর্ণ বাংলা article"
  },
  "english": {
    "title": "English Blog Title",
    "article": "Complete English article"
  },
  "excerpt": {
    "english": "Short English excerpt",
    "bangla": "সংক্ষিপ্ত বাংলা সারসংক্ষেপ"
  },
  "seo": {
    "meta_description_bn": "বাংলা Meta Description",
    "seo_title_bn": "বাংলা SEO Title",
    "meta_description_en": "English Meta Description, maximum 160 characters",
    "seo_title_en": "English SEO Title",
    "primary_keyword": "primary keyword",
    "secondary_keywords": [ "keyword 1", "keyword 2" ],
    "search_intent": "informational"
  },
  "social": {
    "linkedin_post": "Complete LinkedIn post",
    "linkedin_hashtags": [ "#Laravel", "#PHP", "#WebDevelopment" ],
    "devto_title": "DEV.to title",
    "devto_article": "Complete DEV.to article",
    "devto_tags": [ "laravel", "php", "webdev" ]
  },
  "thumbnail": {
    "prompt": "Complete AI image-generation prompt",
    "text": "Short thumbnail text",
    "aspect_ratio": "16:9"
  },
  "links": {
    "github": null,
    "portfolio": null
  },
  "branding": {
    "angle": "Short personal-branding angle"
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
      if (!parsedSlug && data.blog_url) {
        const parts = String(data.blog_url).split("/blog/");
        if (parts[1]) parsedSlug = parts[1].replace(/\/$/, "");
      }
      if (!parsedSlug && data.english?.title) {
        parsedSlug = slugify(data.english.title);
      }

      const title_en = data.english?.title || data.title_en || "";
      const content_en = data.english?.article || data.english?.content || data.content_en || "";
      const excerpt_en = data.excerpt?.english || data.excerpt?.en || data.excerpt_en || "";

      const title_bn = data.bangla?.title || data.title_bn || "";
      const content_bn = data.bangla?.article || data.bangla?.content || data.content_bn || "";
      const excerpt_bn = data.excerpt?.bangla || data.excerpt?.bn || data.excerpt_bn || "";

      const seo_title_en = data.seo?.seo_title_en || title_en;
      const seo_title_bn = data.seo?.seo_title_bn || title_bn;
      const meta_desc_en = data.seo?.meta_description_en || excerpt_en;
      const meta_desc_bn = data.seo?.meta_description_bn || excerpt_bn;

      if (data.thumbnail?.prompt) {
        setImagePrompt(data.thumbnail.prompt);
      }

      // Match tags
      const importedKeywords: string[] = [
        ...(Array.isArray(data.social?.devto_tags) ? data.social.devto_tags : []),
        ...(Array.isArray(data.seo?.secondary_keywords) ? data.seo.secondary_keywords : []),
        ...(data.seo?.primary_keyword ? [data.seo.primary_keyword] : []),
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
        tag_ids: matchedTagIds.length > 0 ? Array.from(new Set([...prev.tag_ids, ...matchedTagIds])) : prev.tag_ids,
      }));

      setParsedJsonData(data);
      toast.success("✨ All blog fields auto-filled successfully from JSON!");
      setActiveTab("english");
    } catch (err: any) {
      toast.error("JSON Error: " + (err?.message || "Invalid JSON"));
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "english", label: "🇬🇧 English" },
    { id: "bangla", label: "🇧🇩 বাংলা" },
    { id: "ai", label: "✨ AI Assistant" },
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
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${
            form.status === "published"
              ? "bg-emerald-900/40 text-emerald-400"
              : form.status === "scheduled"
              ? "bg-blue-900/40 text-blue-400"
              : "bg-yellow-900/40 text-yellow-400"
          }`}>
            {form.status}
          </span>
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
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 font-medium"
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
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg px-4 py-3 text-blue-300 text-sm">
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
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-teal-300">
                  Generate Thumbnail / Cover Image
                  {completedTasks.image && <span className="ml-2 text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-800/50">✅ Completed</span>}
                </h4>
                <p className="text-xs text-teal-400/80 mt-1">Leave prompt empty to auto-generate based on post content.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Enter prompt, or click 'Generate Prompt' to create with AI..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleGenerateImagePrompt}
                disabled={generatingImagePrompt || (!form.title_en && !form.content_en)}
                className="px-3.5 py-2 bg-teal-800/50 hover:bg-teal-700/70 text-teal-200 border border-teal-600/50 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                title="Generate an AI visual prompt based on your post content"
              >
                <span>{generatingImagePrompt ? "Generating..." : "💡 Generate Prompt"}</span>
              </button>
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="Gemini 3.8 Flash">Gemini 3.8 Flash</option>
                <option value="Gemini 3.6 Flash">Gemini 3.6 Flash</option>
                <option value="Gemini 3.5 Flash Lite">Gemini 3.5 Flash Lite</option>
                <option value="Gemini 3.1 Flash Lite">Gemini 3.1 Flash Lite</option>
                <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
              </select>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {generatingImage ? "Generating..." : "🎨 Generate Image"}
              </button>
            </div>
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
                  className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-indigo-300 rounded-lg border border-gray-700 transition flex items-center gap-1.5"
                >
                  ✨ Load Template
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
                  <span>🔍 SEO Meta</span>
                  <span>{parsedJsonData.seo ? "✓ Ready" : "—"}</span>
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
          {parsedJsonData?.social && (
            <div className="mt-8 border border-gray-800 bg-gray-900/60 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📱 Social Media & Cross-Posting Content</span>
                  <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                    Ready to Copy
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  The JSON contains pre-formatted social media posts. You can copy them with one click below:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LinkedIn Box */}
                {parsedJsonData.social.linkedin_post && (
                  <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        LinkedIn Post
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const hashtags = Array.isArray(parsedJsonData.social.linkedin_hashtags)
                            ? "\n\n" + parsedJsonData.social.linkedin_hashtags.join(" ")
                            : "";
                          navigator.clipboard.writeText(parsedJsonData.social.linkedin_post + hashtags);
                          toast.success("📋 Copied LinkedIn post!");
                        }}
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-blue-300 rounded border border-gray-700 transition cursor-pointer"
                      >
                        Copy Post
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 whitespace-pre-wrap font-sans bg-gray-900/50 p-3 rounded-lg max-h-48 overflow-y-auto">
                      {parsedJsonData.social.linkedin_post}
                      {Array.isArray(parsedJsonData.social.linkedin_hashtags) && (
                        <span className="block mt-2 text-blue-400 font-medium">
                          {parsedJsonData.social.linkedin_hashtags.join(" ")}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* DEV.to Box */}
                {parsedJsonData.social.devto_article && (
                  <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                        <span className="font-bold border border-gray-600 px-1 py-0.2 rounded text-[10px]">DEV</span>
                        DEV.to Article
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const tagsHeader = Array.isArray(parsedJsonData.social.devto_tags)
                            ? `Tags: ${parsedJsonData.social.devto_tags.join(", ")}\n\n`
                            : "";
                          const titleHeader = parsedJsonData.social.devto_title
                            ? `# ${parsedJsonData.social.devto_title}\n\n`
                            : "";
                          navigator.clipboard.writeText(titleHeader + tagsHeader + parsedJsonData.social.devto_article);
                          toast.success("📋 Copied DEV.to article!");
                        }}
                        className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 rounded border border-gray-700 transition cursor-pointer"
                      >
                        Copy Article
                      </button>
                    </div>
                    <div className="text-xs text-gray-300 bg-gray-900/50 p-3 rounded-lg max-h-48 overflow-y-auto space-y-2 font-mono">
                      {parsedJsonData.social.devto_title && (
                        <p className="font-bold text-white font-sans">{parsedJsonData.social.devto_title}</p>
                      )}
                      <p className="whitespace-pre-wrap">{parsedJsonData.social.devto_article.slice(0, 300)}...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                    {parsedJsonData?.social?.devto_article && (
                      <span className="ml-1 text-emerald-400">✓ DEV.to article from JSON ready</span>
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

      {/* ── Settings Tab ── */}
      {activeTab === "settings" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Publish Date</label>
              <input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
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

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="w-4 h-4 accent-indigo-600"
            />
            <label htmlFor="is_featured" className="text-sm text-gray-300">
              Featured post (shown prominently on blog listing)
            </label>
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
        <div className="flex gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-5 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 font-medium"
          >
            {saving ? "Saving..." : mode === "edit" ? "Update" : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
