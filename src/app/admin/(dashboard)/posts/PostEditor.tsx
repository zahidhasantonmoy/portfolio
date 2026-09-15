"use client";

import { useState, useCallback } from "react";
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

type TabType = "english" | "bangla" | "ai" | "settings";

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
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("Gemini 3.6 Flash");
  
  const [generatingPost, setGeneratingPost] = useState(false);
  const [postTopic, setPostTopic] = useState("");

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
        body: JSON.stringify({ title: form.title_en, content: form.content_en }),
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
      toast.success("✨ SEO metadata auto-generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate SEO");
    } finally {
      setGeneratingSEO(false);
    }
  }

  async function handleGeneratePost() {
    setGeneratingPost(true);
    const loadingToast = toast.loading("✍️ Generating full blog post... This can take up to 60 seconds.");
    
    try {
      const res = await fetch("/api/admin/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: postTopic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate post");

      setForm((prev) => ({
        ...prev,
        title_en: data.title_en || prev.title_en,
        slug: slugify(data.title_en || prev.title_en),
        excerpt_en: data.excerpt_en || prev.excerpt_en,
        content_en: data.content_en || prev.content_en,
        seo_title_en: data.seo_title_en || prev.seo_title_en,
        meta_desc_en: data.meta_desc_en || prev.meta_desc_en,
      }));

      toast.success("✨ Blog post generated successfully!");
      // Automatically switch to English tab so the user can see the generated content
      setActiveTab("english");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate post");
    } finally {
      toast.dismiss(loadingToast);
      setGeneratingPost(false);
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
      
      toast.success("Image generated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Generation failed: " + err.message);
    } finally {
      toast.dismiss(loadingToast);
      setGeneratingImage(false);
    }
  }

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
      toast.success("✨ Auto-translated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setTranslating(false);
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
        body: JSON.stringify({ content_en: form.content_en }),
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
        
        toast.success(`✨ Generated excerpts & found ${newTagIds.length} matching tags!`);
      } else {
        toast.success("✨ Excerpts generated successfully!");
      }

    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate meta");
    } finally {
      setGeneratingMeta(false);
    }
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "english", label: "🇬🇧 English" },
    { id: "bangla", label: "🇧🇩 বাংলা" },
    { id: "ai", label: "✨ AI Assistant" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Top toolbar */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
            📝 Blog Post
          </span>
          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
            form.status === "published"
              ? "bg-emerald-900/40 text-emerald-400"
              : form.status === "scheduled"
              ? "bg-blue-900/40 text-blue-400"
              : "bg-yellow-900/40 text-yellow-400"
          }`}>
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition"
            >
              Delete
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
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
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

          <div data-color-mode="dark">
            <label className="block text-sm font-medium text-gray-300 mb-2">Content (English — Markdown)</label>
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

          <div data-color-mode="dark">
            <label className="block text-sm font-medium text-gray-300 mb-2">বিষয়বস্তু (বাংলা — Markdown)</label>
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
          
          {/* Action 1: Translation */}
          <div className="flex items-center justify-between bg-blue-900/20 border border-blue-800/50 p-4 rounded-xl">
            <div>
              <h4 className="text-sm font-semibold text-blue-300">Auto Translate to Bengali</h4>
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
              <h4 className="text-sm font-semibold text-purple-300">Generate Excerpts & Tags</h4>
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
              <h4 className="text-sm font-semibold text-indigo-300">AI SEO Generator</h4>
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
                <h4 className="text-sm font-semibold text-teal-300">Generate Thumbnail / Cover Image</h4>
                <p className="text-xs text-teal-400/80 mt-1">Leave prompt empty to auto-generate based on post content.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Enter prompt (optional) or leave blank for auto-generation..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
              />
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500"
              >
                <option value="Gemini 3.6 Flash">Gemini 3.6 Flash</option>
                <option value="Gemini 2.5 Flash">Gemini 2.5 Flash</option>
                <option value="Gemini 3.1 Flash Lite">Gemini 3.1 Flash Lite</option>
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
                <h4 className="text-sm font-semibold text-emerald-300">AI Auto Post Generator</h4>
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
