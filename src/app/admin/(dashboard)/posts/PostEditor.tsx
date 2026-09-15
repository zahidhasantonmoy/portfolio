"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

type TabType = "english" | "bangla" | "seo" | "settings";

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    published_at: post?.published_at ? post.published_at.slice(0, 16) : "",
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
    setError("");
    setSuccess("");

    if (!form.title_en.trim()) {
      setError("English title is required.");
      setSaving(false);
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required.");
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

      setSuccess("Saved successfully!");

      if (mode === "create") {
        router.push(`/admin/posts/${data.post.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post?.id || !confirm("Delete this post permanently?")) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/posts");
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "english", label: "🇬🇧 English" },
    { id: "bangla", label: "🇧🇩 বাংলা" },
    { id: "seo", label: "🔍 SEO" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Status alerts */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Top toolbar */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <select
            value={form.post_type}
            onChange={(e) => setForm({ ...form, post_type: e.target.value as "blog" | "journal" })}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="blog">📝 Blog Post</option>
            <option value="journal">📓 Journal Entry</option>
          </select>
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

      {/* ── SEO Tab ── */}
      {activeTab === "seo" && (
        <div className="space-y-5">
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
