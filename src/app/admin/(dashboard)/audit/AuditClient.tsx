"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaPen,
  FaGlobe,
  FaImage,
  FaLanguage,
  FaClock,
  FaFilter,
  FaLink,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import type { LinkCheckResult } from "@/app/api/admin/audit/links/route";

export interface PostAuditItem {
  id: string;
  title_en: string;
  title_bn: string;
  slug: string;
  excerpt_en: string;
  content_en: string;
  content_bn: string;
  cover_image_url: string;
  published_at: string | null;
  updated_at: string;
  post_type: string;
  status: string;
}

export interface ProjectAuditItem {
  id: string;
  title: string;
  description: string;
  live_url: string;
  github_url: string;
  image_url: string;
  tech_stack: string;
  created_at: string;
}

export default function AuditClient({
  initialPosts,
  initialProjects,
}: {
  initialPosts: PostAuditItem[];
  initialProjects: ProjectAuditItem[];
}) {
  const [activeTab, setActiveTab] = useState<"seo" | "links" | "projects">("seo");
  const [scanningLinks, setScanningLinks] = useState(false);
  const [linkResults, setLinkResults] = useState<LinkCheckResult[]>([]);
  const [linkFilter, setLinkFilter] = useState<"all" | "broken" | "ok">("all");
  const [seoFilter, setSeoFilter] = useState<"all" | "issues_only">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Single test URL input
  const [customTestUrl, setCustomTestUrl] = useState("");
  const [testingCustomUrl, setTestingCustomUrl] = useState(false);

  // Run full link scan
  const handleScanLinks = async () => {
    setScanningLinks(true);
    const toastId = toast.loading("Crawling articles & projects for broken links...");
    try {
      const res = await fetch("/api/admin/audit/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");

      setLinkResults(data.results || []);
      if (data.brokenCount > 0) {
        toast.error(`Found ${data.brokenCount} broken or unreachable links!`, { id: toastId });
      } else {
        toast.success(`All ${data.totalScanned} links verified healthy!`, { id: toastId });
      }
      setActiveTab("links");
    } catch (err: any) {
      toast.error(err.message || "Failed to scan links", { id: toastId });
    } finally {
      setScanningLinks(false);
    }
  };

  // Test custom link
  const handleTestCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTestUrl.trim()) return;
    setTestingCustomUrl(true);
    try {
      const res = await fetch("/api/admin/audit/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: [
            {
              url: customTestUrl.trim(),
              sourceType: "post",
              sourceId: "custom",
              sourceTitle: "Manual Test",
              linkText: "Custom URL",
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed");

      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        setLinkResults((prev) => [r, ...prev]);
        if (r.ok) {
          toast.success(`Healthy! HTTP ${r.status} (${r.latencyMs}ms)`);
        } else {
          toast.error(`Broken / Error: ${r.error || "Unreachable"}`);
        }
        setCustomTestUrl("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to test URL");
    } finally {
      setTestingCustomUrl(false);
    }
  };

  // SEO Health Diagnostics for each post
  const analyzedPosts = useMemo(() => {
    const sixMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 180;

    return initialPosts.map((post) => {
      const issues: { type: "error" | "warning"; message: string }[] = [];

      // 1. Title Length Check
      const titleLen = post.title_en.trim().length;
      if (titleLen === 0) issues.push({ type: "error", message: "Missing English Title" });
      else if (titleLen < 30) issues.push({ type: "warning", message: `Title too short (${titleLen} chars, ideal: 40-70)` });
      else if (titleLen > 75) issues.push({ type: "warning", message: `Title too long (${titleLen} chars, may truncate in SERP)` });

      // 2. Meta Description Check
      const descLen = (post.excerpt_en || "").trim().length;
      if (descLen === 0) issues.push({ type: "error", message: "Missing Meta Description / Excerpt" });
      else if (descLen < 100) issues.push({ type: "warning", message: `Description too short (${descLen} chars, ideal: 120-165)` });

      // 3. Cover Image Check
      if (!post.cover_image_url || !post.cover_image_url.trim()) {
        issues.push({ type: "warning", message: "Missing Cover / OG Image" });
      }

      // 4. Bangla Localization Check
      if (!post.title_bn || !post.title_bn.trim() || !post.content_bn || post.content_bn.trim().length < 20) {
        issues.push({ type: "warning", message: "Missing Bengali (বাংলা) Translation" });
      }

      // 5. Stale Content Check (>6 months without update)
      const lastUpdate = new Date(post.updated_at || post.published_at || "").getTime();
      if (lastUpdate && lastUpdate < sixMonthsAgo && post.status === "published") {
        issues.push({ type: "warning", message: "Stale Content (>6 months old, review for freshness)" });
      }

      const score = Math.max(20, 100 - issues.filter((i) => i.type === "error").length * 30 - issues.filter((i) => i.type === "warning").length * 15);

      return {
        ...post,
        issues,
        score,
        hasIssues: issues.length > 0,
      };
    });
  }, [initialPosts]);

  // Overall System Health Score
  const healthStats = useMemo(() => {
    const totalPosts = analyzedPosts.length;
    const cleanPosts = analyzedPosts.filter((p) => !p.hasIssues).length;
    const brokenLinks = linkResults.filter((l) => !l.ok).length;
    const missingCovers = analyzedPosts.filter((p) => !p.cover_image_url).length;
    const missingTranslations = analyzedPosts.filter((p) => !p.title_bn || !p.content_bn).length;

    const postQualityAvg = totalPosts > 0 ? Math.round(analyzedPosts.reduce((acc, p) => acc + p.score, 0) / totalPosts) : 100;
    const overallScore = Math.max(10, Math.min(100, postQualityAvg - brokenLinks * 5));

    return {
      overallScore,
      totalPosts,
      cleanPosts,
      brokenLinks,
      missingCovers,
      missingTranslations,
      scannedLinksCount: linkResults.length,
    };
  }, [analyzedPosts, linkResults]);

  // Filtered views
  const filteredPosts = useMemo(() => {
    return analyzedPosts.filter((post) => {
      if (seoFilter === "issues_only" && !post.hasIssues) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return post.title_en.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q);
      }
      return true;
    });
  }, [analyzedPosts, seoFilter, searchQuery]);

  const filteredLinks = useMemo(() => {
    return linkResults.filter((l) => {
      if (linkFilter === "broken" && l.ok) return false;
      if (linkFilter === "ok" && !l.ok) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return l.url.toLowerCase().includes(q) || l.sourceTitle.toLowerCase().includes(q);
      }
      return true;
    });
  }, [linkResults, linkFilter, searchQuery]);

  return (
    <div className="max-w-7xl space-y-8 pb-16">
      {/* Header & Score Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Site SEO &amp; Broken Link Diagnostic Audit
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                healthStats.overallScore >= 85
                  ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-400"
                  : healthStats.overallScore >= 70
                  ? "bg-amber-950/70 border border-amber-500/40 text-amber-400"
                  : "bg-red-950/70 border border-red-500/40 text-red-400"
              }`}
            >
              <HiSparkles className="text-xs" />
              {healthStats.overallScore}/100 Health Score
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Automated crawler detecting 404 broken links, search snippet readability, missing translations, and image assets.
          </p>
        </div>

        {/* Global Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleScanLinks}
            disabled={scanningLinks}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white shadow-md shadow-rose-900/30 transition active:scale-95 disabled:opacity-50"
          >
            <FaSyncAlt className={`text-xs ${scanningLinks ? "animate-spin" : ""}`} />
            <span>{scanningLinks ? "Scanning All Links..." : "🕷️ Run Full Link Crawler"}</span>
          </button>
        </div>
      </div>

      {/* KPI Diagnostic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Broken Links */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-medium text-gray-400">Broken External Links</p>
          <p
            className={`text-2xl font-bold ${
              healthStats.brokenLinks > 0 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {healthStats.brokenLinks}
          </p>
          <p className="text-[11px] text-gray-500">
            {healthStats.scannedLinksCount > 0
              ? `out of ${healthStats.scannedLinksCount} checked`
              : "Click crawler to scan"}
          </p>
        </div>

        {/* Clean Posts */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-medium text-gray-400">100% SEO Ready Posts</p>
          <p className="text-2xl font-bold text-emerald-400">
            {healthStats.cleanPosts} / {healthStats.totalPosts}
          </p>
          <p className="text-[11px] text-gray-500">Passed all SEO checklists</p>
        </div>

        {/* Missing Covers */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-medium text-gray-400">Missing Cover Images</p>
          <p
            className={`text-2xl font-bold ${
              healthStats.missingCovers > 0 ? "text-amber-400" : "text-gray-300"
            }`}
          >
            {healthStats.missingCovers}
          </p>
          <p className="text-[11px] text-gray-500">Need thumbnail for social sharing</p>
        </div>

        {/* Missing Translations */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-medium text-gray-400">Missing Bangla Content</p>
          <p
            className={`text-2xl font-bold ${
              healthStats.missingTranslations > 0 ? "text-purple-400" : "text-gray-300"
            }`}
          >
            {healthStats.missingTranslations}
          </p>
          <p className="text-[11px] text-gray-500">Regional audience discovery</p>
        </div>

        {/* Total Projects */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 shadow-sm space-y-1">
          <p className="text-xs font-medium text-gray-400">Live Projects</p>
          <p className="text-2xl font-bold text-indigo-400">{initialProjects.length}</p>
          <p className="text-[11px] text-gray-500">Portfolios &amp; Case Studies</p>
        </div>
      </div>

      {/* Manual Quick Link Tester Bar */}
      <form
        onSubmit={handleTestCustomUrl}
        className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 shrink-0">
          <FaLink className="text-indigo-400" />
          <span>Quick Single Link Test:</span>
        </div>
        <input
          type="url"
          required
          value={customTestUrl}
          onChange={(e) => setCustomTestUrl(e.target.value)}
          placeholder="https://example.com/demo or https://github.com/..."
          className="flex-1 w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono"
        />
        <button
          type="submit"
          disabled={testingCustomUrl}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white transition active:scale-95 shrink-0 disabled:opacity-50"
        >
          {testingCustomUrl ? "Testing..." : "Test URL"}
        </button>
      </form>

      {/* Tab Selectors & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "seo"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            📝 Blog SEO Health ({analyzedPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("links")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "links"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span>🔗 Scanned Links</span>
            {healthStats.brokenLinks > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
                {healthStats.brokenLinks}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === "projects"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            🚀 Projects Portfolio ({initialProjects.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title or URL..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Tab 1: Blog SEO Health Diagnostics */}
      {activeTab === "seo" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setSeoFilter("all")}
                className={`px-3 py-1 rounded-lg transition ${
                  seoFilter === "all" ? "bg-gray-800 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                All Articles ({analyzedPosts.length})
              </button>
              <button
                onClick={() => setSeoFilter("issues_only")}
                className={`px-3 py-1 rounded-lg transition ${
                  seoFilter === "issues_only" ? "bg-amber-950/60 text-amber-300 font-semibold border border-amber-500/30" : "text-gray-400 hover:text-white"
                }`}
              >
                Needs Optimization ({analyzedPosts.filter((p) => p.hasIssues).length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 hover:border-gray-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          post.score >= 80
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : post.score >= 60
                            ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                            : "bg-red-950 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {post.score}% Score
                      </span>
                      <span className="text-xs text-gray-500 font-mono">/{post.slug}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{post.title_en}</h3>
                  </div>

                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    <span>Fix in Editor</span>
                    <FaPen className="text-[10px]" />
                  </Link>
                </div>

                {/* Issues List or Clean Badge */}
                {post.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-xl">
                    <FaCheckCircle className="text-xs" />
                    <span>All SEO checks passed! Optimal title length, rich description, and localized content.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {post.issues.map((issue, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border ${
                          issue.type === "error"
                            ? "bg-red-950/40 border-red-500/30 text-red-300"
                            : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                        }`}
                      >
                        {issue.type === "error" ? (
                          <FaTimesCircle className="text-xs shrink-0" />
                        ) : (
                          <FaExclamationTriangle className="text-xs shrink-0" />
                        )}
                        <span>{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Scanned Links Report */}
      {activeTab === "links" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setLinkFilter("all")}
                className={`px-3 py-1 rounded-lg transition ${
                  linkFilter === "all" ? "bg-gray-800 text-white font-medium" : "text-gray-400 hover:text-white"
                }`}
              >
                All Links ({linkResults.length})
              </button>
              <button
                onClick={() => setLinkFilter("broken")}
                className={`px-3 py-1 rounded-lg transition ${
                  linkFilter === "broken" ? "bg-red-950/60 text-red-300 font-semibold border border-red-500/30" : "text-gray-400 hover:text-white"
                }`}
              >
                Broken Only ({linkResults.filter((l) => !l.ok).length})
              </button>
              <button
                onClick={() => setLinkFilter("ok")}
                className={`px-3 py-1 rounded-lg transition ${
                  linkFilter === "ok" ? "bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-500/30" : "text-gray-400 hover:text-white"
                }`}
              >
                Healthy Only ({linkResults.filter((l) => l.ok).length})
              </button>
            </div>
          </div>

          {linkResults.length === 0 ? (
            <div className="py-20 text-center bg-gray-900/30 border border-gray-800 rounded-2xl space-y-3">
              <FaLink className="text-4xl text-gray-600 mx-auto" />
              <h3 className="text-sm font-semibold text-gray-300">No links scanned yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Click the &ldquo;Run Full Link Crawler&rdquo; button above to automatically test all external GitHub, live demo, and blog citation links.
              </p>
              <button
                type="button"
                onClick={handleScanLinks}
                disabled={scanningLinks}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Start Crawler Now 🚀
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLinks.map((l, idx) => (
                <div
                  key={idx}
                  className={`bg-gray-900/90 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                    l.ok ? "border-gray-800/80" : "border-red-500/40 bg-red-950/10"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono uppercase ${
                          l.ok
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-950 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {l.status > 0 ? `HTTP ${l.status}` : "FAILED"}
                      </span>
                      <span className="text-gray-400 font-medium truncate">
                        Source: {l.sourceTitle}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">({l.latencyMs}ms)</span>
                    </div>

                    <p className="font-mono text-gray-300 text-xs break-all" title={l.url}>
                      {l.url}
                    </p>

                    {!l.ok && l.error && (
                      <p className="text-[11px] text-red-400 font-medium">Error: {l.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
                      title="Open target URL in new tab"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                    <Link
                      href={
                        l.sourceType === "project"
                          ? "/admin/projects"
                          : `/admin/posts/${l.sourceId}/edit`
                      }
                      className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-indigo-300 transition font-medium"
                    >
                      Edit Source
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Projects Portfolio Audit */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialProjects.map((prj) => {
            const hasLive = Boolean(prj.live_url && prj.live_url.trim());
            const hasGithub = Boolean(prj.github_url && prj.github_url.trim());
            const hasImage = Boolean(prj.image_url && prj.image_url.trim());

            return (
              <div
                key={prj.id}
                className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{prj.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{prj.description}</p>
                  </div>
                  <Link
                    href="/admin/projects"
                    className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition shrink-0"
                    title="Edit in Projects Manager"
                  >
                    <FaPen className="text-xs" />
                  </Link>
                </div>

                {/* Health Check Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/80 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 p-2 rounded-xl border ${
                      hasLive
                        ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
                        : "bg-red-950/30 border-red-500/20 text-red-400"
                    }`}
                  >
                    {hasLive ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span>Live Demo</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 p-2 rounded-xl border ${
                      hasGithub
                        ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-950/30 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {hasGithub ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    <span>GitHub Code</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 p-2 rounded-xl border ${
                      hasImage
                        ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400"
                        : "bg-red-950/30 border-red-500/20 text-red-400"
                    }`}
                  >
                    {hasImage ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span>Hero Image</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
