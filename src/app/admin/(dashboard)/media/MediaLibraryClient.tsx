"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt,
  FaCloudUploadAlt,
  FaPlus,
  FaImage,
  FaTimes,
  FaDownload,
  FaLink,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  source: "blog" | "journal" | "project" | "upload";
  sourceId?: string;
  createdAt: string;
}

export default function MediaLibraryClient({
  initialMedia,
}: {
  initialMedia: MediaItem[];
}) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [filter, setFilter] = useState<"all" | "blog" | "journal" | "project" | "upload">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<"url" | "markdown" | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<MediaItem | null>(null);

  // Manual Add URL modal state
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  // Load any previously uploaded/custom media from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_custom_media");
      if (stored) {
        const parsed: MediaItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMediaList((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = parsed.filter((m) => !existingIds.has(m.id));
            return [...newOnes, ...prev];
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const saveCustomMedia = (newItem: MediaItem) => {
    try {
      const stored = localStorage.getItem("admin_custom_media");
      const parsed: MediaItem[] = stored ? JSON.parse(stored) : [];
      const updated = [newItem, ...parsed.filter((m) => m.url !== newItem.url)];
      localStorage.setItem("admin_custom_media", JSON.stringify(updated.slice(0, 50)));
    } catch {
      // ignore
    }
  };

  const handleUploadSuccess = (result: any) => {
    if (result.info && result.info.secure_url) {
      const uploadedItem: MediaItem = {
        id: `upload-${Date.now()}`,
        url: result.info.secure_url,
        title: result.info.original_filename || "Uploaded Asset",
        source: "upload",
        createdAt: new Date().toISOString(),
      };
      setMediaList((prev) => [uploadedItem, ...prev]);
      saveCustomMedia(uploadedItem);
      toast.success("Image uploaded and added to Media Library!");
    }
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const manualItem: MediaItem = {
      id: `manual-${Date.now()}`,
      url: newUrl.trim(),
      title: newTitle.trim() || "Web Image Asset",
      source: "upload",
      createdAt: new Date().toISOString(),
    };
    setMediaList((prev) => [manualItem, ...prev]);
    saveCustomMedia(manualItem);
    setNewUrl("");
    setNewTitle("");
    setShowAddUrlModal(false);
    toast.success("External asset URL added to Media Library!");
  };

  const copyToClipboard = async (text: string, id: string, type: "url" | "markdown") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopiedType(type);
      toast.success(type === "url" ? "Image URL copied!" : "Markdown image tag copied!");
      setTimeout(() => {
        setCopiedId(null);
        setCopiedType(null);
      }, 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      if (filter !== "all" && item.source !== filter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesUrl = item.url.toLowerCase().includes(q);
        return matchesTitle || matchesUrl;
      }
      return true;
    });
  }, [mediaList, filter, searchQuery]);

  const stats = useMemo(() => {
    const total = mediaList.length;
    const blog = mediaList.filter((m) => m.source === "blog").length;
    const journal = mediaList.filter((m) => m.source === "journal").length;
    const project = mediaList.filter((m) => m.source === "project").length;
    const upload = mediaList.filter((m) => m.source === "upload").length;
    return { total, blog, journal, project, upload };
  }, [mediaList]);

  return (
    <div className="max-w-7xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Media &amp; Image Assets Library
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/70 border border-indigo-500/40 text-indigo-400">
              <FaImage className="text-xs" />
              {stats.total} Assets
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Browse, upload, and quickly copy CDN URLs or Markdown tags for your blog posts, projects, and social feeds.
          </p>
        </div>

        {/* Upload & Add Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAddUrlModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition active:scale-95 shadow-sm"
          >
            <FaLink className="text-xs text-indigo-400" />
            <span>Add Image URL</span>
          </button>

          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "portfolio_preset"}
            onSuccess={handleUploadSuccess}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 transition active:scale-95"
              >
                <FaCloudUploadAlt className="text-sm" />
                <span>Upload Media</span>
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setFilter("all")}
          className={`cursor-pointer p-3.5 rounded-xl border transition ${
            filter === "all"
              ? "bg-indigo-950/40 border-indigo-500/60 shadow-sm"
              : "bg-gray-900/60 border-gray-800/80 hover:border-gray-700"
          }`}
        >
          <p className="text-xs text-gray-400 font-medium">All Media</p>
          <p className="text-xl font-bold text-white mt-0.5">{stats.total}</p>
        </div>

        <div
          onClick={() => setFilter("blog")}
          className={`cursor-pointer p-3.5 rounded-xl border transition ${
            filter === "blog"
              ? "bg-blue-950/40 border-blue-500/60 shadow-sm"
              : "bg-gray-900/60 border-gray-800/80 hover:border-gray-700"
          }`}
        >
          <p className="text-xs text-gray-400 font-medium">Blog Covers</p>
          <p className="text-xl font-bold text-blue-400 mt-0.5">{stats.blog}</p>
        </div>

        <div
          onClick={() => setFilter("journal")}
          className={`cursor-pointer p-3.5 rounded-xl border transition ${
            filter === "journal"
              ? "bg-purple-950/40 border-purple-500/60 shadow-sm"
              : "bg-gray-900/60 border-gray-800/80 hover:border-gray-700"
          }`}
        >
          <p className="text-xs text-gray-400 font-medium">Dev Journals</p>
          <p className="text-xl font-bold text-purple-400 mt-0.5">{stats.journal}</p>
        </div>

        <div
          onClick={() => setFilter("project")}
          className={`cursor-pointer p-3.5 rounded-xl border transition ${
            filter === "project"
              ? "bg-emerald-950/40 border-emerald-500/60 shadow-sm"
              : "bg-gray-900/60 border-gray-800/80 hover:border-gray-700"
          }`}
        >
          <p className="text-xs text-gray-400 font-medium">Projects</p>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{stats.project}</p>
        </div>

        <div
          onClick={() => setFilter("upload")}
          className={`cursor-pointer p-3.5 rounded-xl border transition ${
            filter === "upload"
              ? "bg-amber-950/40 border-amber-500/60 shadow-sm"
              : "bg-gray-900/60 border-gray-800/80 hover:border-gray-700"
          }`}
        >
          <p className="text-xs text-gray-400 font-medium">Direct Uploads</p>
          <p className="text-xl font-bold text-amber-400 mt-0.5">{stats.upload}</p>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900/80 border border-gray-800 p-3 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by title or URL..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "blog", "journal", "project", "upload"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {f === "all" ? "All Assets" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Media Gallery Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 border border-gray-800/80 rounded-2xl">
          <FaImage className="text-4xl text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-300">No media assets found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No images match "${searchQuery}". Try a different search term.`
              : "Upload an image using Cloudinary or add an external URL to start building your media library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredMedia.map((item) => {
            const isCopiedUrl = copiedId === item.id && copiedType === "url";
            const isCopiedMarkdown = copiedId === item.id && copiedType === "markdown";

            let badgeBg = "bg-gray-800 text-gray-300";
            if (item.source === "blog") badgeBg = "bg-blue-950/80 text-blue-400 border border-blue-500/30";
            if (item.source === "journal") badgeBg = "bg-purple-950/80 text-purple-400 border border-purple-500/30";
            if (item.source === "project") badgeBg = "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30";
            if (item.source === "upload") badgeBg = "bg-amber-950/80 text-amber-400 border border-amber-500/30";

            return (
              <div
                key={item.id}
                className="group bg-gray-900/90 border border-gray-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-indigo-950/30 transition duration-200 flex flex-col"
              >
                {/* Image Container with Hover Overlay */}
                <div
                  className="relative aspect-[16/10] bg-gray-950 overflow-hidden cursor-pointer"
                  onClick={() => setActiveModalItem(item)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1.5">
                      <FaExternalLinkAlt className="text-[10px]" /> Full Preview
                    </span>
                  </div>

                  {/* Badge */}
                  <span
                    className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${badgeBg}`}
                  >
                    {item.source}
                  </span>
                </div>

                {/* Details & Actions */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4
                      className="text-xs font-semibold text-white line-clamp-1 group-hover:text-indigo-300 transition"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5" title={item.url}>
                      {item.url}
                    </p>
                  </div>

                  {/* Copy Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-800/70">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.url, item.id, "url")}
                      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition active:scale-95 ${
                        isCopiedUrl
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white"
                      }`}
                      title="Copy direct image URL"
                    >
                      {isCopiedUrl ? <FaCheck className="text-[10px]" /> : <FaCopy className="text-[10px]" />}
                      <span>{isCopiedUrl ? "Copied!" : "Copy URL"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(`![${item.title.replace(/[\[\]]/g, "")}](${item.url})`, item.id, "markdown")
                      }
                      className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition active:scale-95 ${
                        isCopiedMarkdown
                          ? "bg-emerald-600 text-white"
                          : "bg-indigo-950/60 hover:bg-indigo-900/70 text-indigo-300 border border-indigo-500/30"
                      }`}
                      title="Copy Markdown image tag ![alt](url)"
                    >
                      {isCopiedMarkdown ? <FaCheck className="text-[10px]" /> : <FaImage className="text-[10px]" />}
                      <span>{isCopiedMarkdown ? "Copied MD!" : "Copy MD"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Full Image Modal */}
      {activeModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalItem(null)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 relative animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{activeModalItem.title}</h3>
                <p className="text-xs text-gray-400 capitalize">Source: {activeModalItem.source}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Image Preview Container */}
            <div className="bg-gray-950 rounded-xl overflow-hidden flex items-center justify-center max-h-[55vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalItem.url}
                alt={activeModalItem.title}
                className="max-h-[55vh] max-w-full object-contain rounded-lg"
              />
            </div>

            {/* URL Display & Actions */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Image CDN Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={activeModalItem.url}
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeModalItem.url, activeModalItem.id, "url")}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shrink-0"
                >
                  <FaCopy className="text-xs" />
                  <span>Copy</span>
                </button>
                <a
                  href={activeModalItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs transition"
                  title="Open full size in new tab"
                >
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            {activeModalItem.sourceId && (
              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-xs">
                <span className="text-gray-400">Attached Resource:</span>
                <Link
                  href={
                    activeModalItem.source === "project"
                      ? "/admin/projects"
                      : `/admin/posts/${activeModalItem.sourceId}/edit`
                  }
                  className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Edit in {activeModalItem.source === "project" ? "Projects" : "Post Editor"}</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Add External URL Modal */}
      {showAddUrlModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAddUrlModal(false)}
        >
          <form
            onSubmit={handleAddManualUrl}
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FaLink className="text-indigo-400" />
                Add External Image URL
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUrlModal(false)}
                className="text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Title / Caption</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Next.js Architecture Diagram"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUrlModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30"
              >
                Add to Library
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
