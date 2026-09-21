'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaLinkedin,
  FaMedium,
  FaTwitter,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaRobot,
  FaPaperPlane,
  FaHistory,
  FaShareAlt,
} from 'react-icons/fa';

interface Post {
  id: string;
  title_en: string;
  slug: string;
  excerpt_en?: string | null;
  content_en?: string | null;
  cover_image_url?: string | null;
  status: string;
  cat_name?: string | null;
}

interface SocialContent {
  linkedin: {
    post: string;
    hashtags: string[];
    hook?: string;
  };
  devto: {
    title: string;
    article: string;
    tags: string[];
  };
  medium: {
    title: string;
    subtitle: string;
    story: string;
    tags: string[];
  };
  twitter: {
    tweet: string;
    thread: string[];
  };
}

interface CrossPostLog {
  id: string;
  postTitle: string;
  platform: 'devto' | 'medium' | 'linkedin' | 'twitter';
  status: string;
  url?: string;
  timestamp: string;
}

export default function SocialManagerClient({ initialPosts }: { initialPosts: Post[] }) {
  const [selectedPostId, setSelectedPostId] = useState<string>(initialPosts[0]?.id || '');
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'devto' | 'medium' | 'twitter'>('linkedin');
  const [generating, setGenerating] = useState(false);
  const [crossPosting, setCrossPosting] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<CrossPostLog[]>([]);

  // Selected post
  const selectedPost = initialPosts.find((p) => p.id === selectedPostId) || initialPosts[0];

  // Platform Content State
  const [social, setSocial] = useState<SocialContent>({
    linkedin: {
      post: '',
      hashtags: ['#WebDev', '#React', '#SoftwareEngineering', '#FullStack'],
    },
    devto: {
      title: '',
      article: '',
      tags: ['webdev', 'javascript', 'programming', 'react'],
    },
    medium: {
      title: '',
      subtitle: '',
      story: '',
      tags: ['Software Development', 'Technology', 'Web Development'],
    },
    twitter: {
      tweet: '',
      thread: [],
    },
  });

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_social_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveHistoryLog = (log: Omit<CrossPostLog, 'id' | 'timestamp'>) => {
    const newLog: CrossPostLog = {
      ...log,
      id: String(Date.now()),
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updated = [newLog, ...history].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem('admin_social_history', JSON.stringify(updated));
    } catch {}
  };

  // Prepopulate when post changes if content is empty
  useEffect(() => {
    if (!selectedPost) return;

    const canonicalUrl = `https://zahidhasantonmoy.vercel.app/blog/${selectedPost.slug}`;
    const defaultHook = `🚀 Just published a new article: "${selectedPost.title_en}"!`;
    const defaultBody = `${defaultHook}\n\n${selectedPost.excerpt_en || 'Here is an in-depth dive into engineering and best practices.'}\n\n👉 Read the full article here:\n${canonicalUrl}?utm_source=linkedin&utm_medium=social`;

    setSocial((prev) => ({
      linkedin: {
        post: prev.linkedin.post || defaultBody,
        hashtags: prev.linkedin.hashtags.length ? prev.linkedin.hashtags : ['#WebDev', '#React', '#FullStack'],
      },
      devto: {
        title: prev.devto.title || selectedPost.title_en,
        article: prev.devto.article || selectedPost.content_en || '',
        tags: prev.devto.tags.length ? prev.devto.tags : ['webdev', 'javascript', 'tech', 'programming'],
      },
      medium: {
        title: prev.medium.title || selectedPost.title_en,
        subtitle: prev.medium.subtitle || selectedPost.excerpt_en || '',
        story: prev.medium.story || selectedPost.content_en || '',
        tags: prev.medium.tags.length ? prev.medium.tags : ['Software Development', 'Web Development'],
      },
      twitter: {
        tweet:
          prev.twitter.tweet ||
          `🚀 Check out my latest article: "${selectedPost.title_en}"\n\n${canonicalUrl}?utm_source=twitter #webdev #react`,
        thread: prev.twitter.thread,
      },
    }));
  }, [selectedPostId]);

  // AI Auto-Generator for All Platforms
  const handleGenerateAll = async () => {
    if (!selectedPost) {
      toast.error('Please select a post first.');
      return;
    }

    setGenerating(true);
    const toastId = toast.loading('✨ Generating tailored content for LinkedIn, DEV.to, Medium & X...');

    try {
      const res = await fetch('/api/admin/generate-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedPost.title_en,
          content: selectedPost.content_en,
          slug: selectedPost.slug,
          tags: selectedPost.cat_name ? [selectedPost.cat_name] : ['Web Development'],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate social content');

      setSocial(data.social);
      toast.success('🎉 Social content generated for all platforms!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Generation failed', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  // Copy helper
  const copyToClipboard = async (text: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`📋 Copied ${label} to clipboard!`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // 1-Click Cross-Post to DEV.to
  const handlePublishDevTo = async () => {
    if (!selectedPost) return;
    setCrossPosting((p) => ({ ...p, devto: true }));
    const toastId = toast.loading('Publishing draft to DEV.to...');

    try {
      const res = await fetch('/api/admin/cross-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'devto',
          title: social.devto.title || selectedPost.title_en,
          content: social.devto.article || selectedPost.content_en,
          tags: social.devto.tags,
          canonicalUrl: `https://zahidhasantonmoy.vercel.app/blog/${selectedPost.slug}`,
          coverImage: selectedPost.cover_image_url,
          description: selectedPost.excerpt_en,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'DEV.to cross-post failed');

      saveHistoryLog({
        postTitle: selectedPost.title_en,
        platform: 'devto',
        status: data.status === 'draft' ? 'Draft created' : 'Published',
        url: data.url,
      });

      toast.success('✅ DEV.to draft created successfully!', { id: toastId });
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to post to DEV.to', { id: toastId });
    } finally {
      setCrossPosting((p) => ({ ...p, devto: false }));
    }
  };

  // 1-Click Cross-Post to Medium
  const handlePublishMedium = async () => {
    if (!selectedPost) return;
    setCrossPosting((p) => ({ ...p, medium: true }));
    const toastId = toast.loading('Publishing story to Medium...');

    try {
      const res = await fetch('/api/admin/cross-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'medium',
          title: social.medium.title || selectedPost.title_en,
          content: social.medium.story || selectedPost.content_en,
          tags: social.medium.tags,
          canonicalUrl: `https://zahidhasantonmoy.vercel.app/blog/${selectedPost.slug}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsToken) {
          // If token missing, give option to copy & open Medium editor directly
          copyToClipboard(
            `# ${social.medium.title}\n\n${social.medium.story}\n\n---\n*Originally published at https://zahidhasantonmoy.vercel.app/blog/${selectedPost.slug}*`,
            'medium_quick',
            'Medium Markdown'
          );
          window.open('https://medium.com/new-story', '_blank');
          toast(
            'MEDIUM_INTEGRATION_TOKEN is not in .env.local. We copied your formatted story and opened Medium editor for you!',
            { id: toastId, icon: '💡', duration: 6000 }
          );
          return;
        }
        throw new Error(data.error || 'Medium cross-post failed');
      }

      saveHistoryLog({
        postTitle: selectedPost.title_en,
        platform: 'medium',
        status: 'Draft created',
        url: data.url,
      });

      toast.success('✅ Medium draft story created successfully!', { id: toastId });
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish to Medium', { id: toastId });
    } finally {
      setCrossPosting((p) => ({ ...p, medium: false }));
    }
  };

  // Share to LinkedIn via Share Intent Modal
  const handleShareLinkedIn = () => {
    if (!selectedPost) return;
    const url = `https://zahidhasantonmoy.vercel.app/blog/${selectedPost.slug}?utm_source=linkedin&utm_medium=social`;
    // Copy the text first so the user can paste it right away in the modal
    const fullText = `${social.linkedin.post}\n\n${social.linkedin.hashtags.join(' ')}`;
    copyToClipboard(fullText, 'linkedin_share', 'LinkedIn text');
    // Open LinkedIn share dialog
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  // Share to Twitter/X
  const handleShareTwitter = () => {
    const text = social.twitter.tweet;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const canonicalUrl = selectedPost
    ? `https://zahidhasantonmoy.vercel.app/blog/${selectedPost.slug}`
    : 'https://zahidhasantonmoy.vercel.app/blog';

  const linkedinCharCount = social.linkedin.post.length + social.linkedin.hashtags.join(' ').length + 2;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span>📡 Social Posts & Syndication Hub</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage, generate AI copy, and cross-post to LinkedIn, DEV.to, Medium, and X from one place.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleGenerateAll}
          disabled={generating || !selectedPost}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95 whitespace-nowrap"
        >
          <FaRobot className="text-base" />
          <span>{generating ? 'Generating AI Content...' : '✨ Generate All Platforms'}</span>
        </button>
      </div>

      {/* Post Selector Bar */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <label htmlFor="post-select" className="text-xs font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
            Select Article:
          </label>
          <select
            id="post-select"
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {initialPosts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title_en} {post.status === 'published' ? '🟢' : '🟡'}
              </option>
            ))}
          </select>
        </div>

        {selectedPost && (
          <div className="flex items-center gap-3 text-xs text-gray-400 w-full md:w-auto justify-end">
            <span className="truncate max-w-[240px] text-gray-300">/blog/{selectedPost.slug}</span>
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-white transition"
              title="Preview Live Article"
            >
              <FaExternalLinkAlt className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Main Multi-Platform Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Platform Switcher & Editors (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Platform Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-gray-900/80 border border-gray-800 rounded-2xl overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActivePlatform('linkedin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePlatform === 'linkedin'
                  ? 'bg-[#0A66C2] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FaLinkedin className="text-base" />
              <span>LinkedIn</span>
            </button>

            <button
              onClick={() => setActivePlatform('devto')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePlatform === 'devto'
                  ? 'bg-gradient-to-r from-gray-800 to-black text-white border border-gray-700 shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="font-extrabold border border-current px-1 py-0.2 rounded text-[10px]">DEV</span>
              <span>DEV.to</span>
            </button>

            <button
              onClick={() => setActivePlatform('medium')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePlatform === 'medium'
                  ? 'bg-[#12100E] text-white border border-green-500/40 shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FaMedium className="text-base text-green-400" />
              <span>Medium</span>
            </button>

            <button
              onClick={() => setActivePlatform('twitter')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePlatform === 'twitter'
                  ? 'bg-[#1DA1F2] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <FaTwitter className="text-base" />
              <span>X (Twitter)</span>
            </button>
          </div>

          {/* Tab 1: LinkedIn Content Editor */}
          {activePlatform === 'linkedin' && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <FaLinkedin /> LinkedIn Post Editor
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold ${
                      linkedinCharCount > 3000 ? 'text-red-400' : 'text-gray-400'
                    }`}
                  >
                    {linkedinCharCount.toLocaleString()} / 3,000 chars
                  </span>
                </div>
              </div>

              <textarea
                rows={12}
                value={social.linkedin.post}
                onChange={(e) =>
                  setSocial((prev) => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, post: e.target.value },
                  }))
                }
                placeholder="Write or auto-generate your LinkedIn post here..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />

              {/* Hashtag Editor */}
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Hashtags (space or comma separated):</label>
                <input
                  type="text"
                  value={social.linkedin.hashtags.join(' ')}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      linkedin: {
                        ...prev.linkedin,
                        hashtags: e.target.value.split(/\s+/).filter(Boolean),
                      },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-blue-400 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${social.linkedin.post}\n\n${social.linkedin.hashtags.join(' ')}`,
                      'linkedin_copy',
                      'LinkedIn Post'
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
                >
                  {copiedKey === 'linkedin_copy' ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  <span>Copy Formatted Post</span>
                </button>

                <button
                  onClick={handleShareLinkedIn}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold shadow-md transition"
                >
                  <FaPaperPlane className="text-xs" />
                  <span>Copy & Share to LinkedIn</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: DEV.to Content Editor */}
          {activePlatform === 'devto' && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <span className="border border-gray-500 px-1 py-0.2 rounded text-[10px]">DEV</span> DEV.to Article
                </span>
                <span className="text-xs text-yellow-400/90 font-medium">Posts as Draft with Canonical Link</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Title:</label>
                <input
                  type="text"
                  value={social.devto.title}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      devto: { ...prev.devto, title: e.target.value },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Tags (max 4, lowercase):</label>
                <input
                  type="text"
                  value={social.devto.tags.join(', ')}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      devto: {
                        ...prev.devto,
                        tags: e.target.value.split(',').map((t) => t.trim().toLowerCase()),
                      },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-indigo-300 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Markdown Body:</label>
                <textarea
                  rows={10}
                  value={social.devto.article}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      devto: { ...prev.devto, article: e.target.value },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handlePublishDevTo}
                  disabled={crossPosting.devto}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  <FaPaperPlane className="text-xs" />
                  <span>{crossPosting.devto ? 'Publishing...' : '🚀 1-Click Publish to DEV.to (Draft)'}</span>
                </button>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `# ${social.devto.title}\n\n${social.devto.article}`,
                      'devto_copy',
                      'DEV.to Markdown'
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
                >
                  {copiedKey === 'devto_copy' ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  <span>Copy Markdown</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Medium Content Editor */}
          {activePlatform === 'medium' && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
                  <FaMedium /> Medium Story Editor
                </span>
                <span className="text-xs text-gray-400">Canonical SEO Protected</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Story Title:</label>
                <input
                  type="text"
                  value={social.medium.title}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      medium: { ...prev.medium, title: e.target.value },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-white text-sm font-semibold focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Subtitle:</label>
                <input
                  type="text"
                  value={social.medium.subtitle}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      medium: { ...prev.medium, subtitle: e.target.value },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-gray-300 text-xs focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Tags (up to 5):</label>
                <input
                  type="text"
                  value={social.medium.tags.join(', ')}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      medium: {
                        ...prev.medium,
                        tags: e.target.value.split(',').map((t) => t.trim()),
                      },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-green-400 text-xs font-medium focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Story Content:</label>
                <textarea
                  rows={8}
                  value={social.medium.story}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      medium: { ...prev.medium, story: e.target.value },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 text-xs font-mono focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handlePublishMedium}
                  disabled={crossPosting.medium}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  <FaPaperPlane className="text-xs" />
                  <span>{crossPosting.medium ? 'Publishing...' : '🚀 1-Click Publish to Medium'}</span>
                </button>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `# ${social.medium.title}\n\n${social.medium.story}\n\n---\n*Originally published at ${canonicalUrl}*`,
                      'medium_copy',
                      'Medium Story'
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
                >
                  {copiedKey === 'medium_copy' ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  <span>Copy Markdown</span>
                </button>

                <a
                  href="https://medium.com/new-story"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition"
                >
                  <span>Open Medium Editor</span>
                  <FaExternalLinkAlt className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}

          {/* Tab 4: Twitter / X Editor */}
          {activePlatform === 'twitter' && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <FaTwitter /> X (Twitter) Post & Thread
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    social.twitter.tweet.length > 280 ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {social.twitter.tweet.length} / 280 chars
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Main Tweet:</label>
                <textarea
                  rows={4}
                  value={social.twitter.tweet}
                  onChange={(e) =>
                    setSocial((prev) => ({
                      ...prev,
                      twitter: { ...prev.twitter, tweet: e.target.value },
                    }))
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              {social.twitter.thread && social.twitter.thread.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-gray-400 block">Thread Breakdown:</label>
                  {social.twitter.thread.map((t, idx) => (
                    <div key={idx} className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300">
                      <span className="font-bold text-sky-400 block mb-1">Part {idx + 1}:</span>
                      {t}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleShareTwitter}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1DA1F2] hover:bg-[#0c85d0] text-white text-xs font-semibold shadow-md transition"
                >
                  <FaTwitter />
                  <span>Tweet on X</span>
                </button>

                <button
                  onClick={() => copyToClipboard(social.twitter.tweet, 'twitter_copy', 'Tweet text')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
                >
                  {copiedKey === 'twitter_copy' ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
                  <span>Copy Tweet</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Feed Simulation Card & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time LinkedIn Feed Simulation Card */}
          <div className="bg-white dark:bg-[#1b1f23] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden text-gray-900 dark:text-gray-100">
            {/* Mock LinkedIn Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                  Z
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm leading-tight text-gray-900 dark:text-white">
                    Zahid Hasan Tonmoy
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                    MERN Full Stack Developer • 1st
                  </p>
                  <p className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <span>Just now</span> • 🌐
                  </p>
                </div>
              </div>
              <span className="text-xs bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full font-bold">
                Feed Preview
              </span>
            </div>

            {/* Mock Post Body */}
            <div className="p-4 space-y-3">
              <p className="text-xs whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200 max-h-56 overflow-y-auto">
                {social.linkedin.post || 'Your LinkedIn post text will be previewed here in real-time...'}
              </p>

              {social.linkedin.hashtags.length > 0 && (
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {social.linkedin.hashtags.join(' ')}
                </p>
              )}
            </div>

            {/* Mock Article Link Card */}
            {selectedPost && (
              <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-3">
                {selectedPost.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedPost.cover_image_url}
                    alt={selectedPost.title_en}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold">
                    {selectedPost.title_en}
                  </div>
                )}
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
                  zahidhasantonmoy.vercel.app
                </p>
                <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
                  {selectedPost.title_en}
                </p>
              </div>
            )}
          </div>

          {/* Cross-Posting History Box */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <FaHistory /> Cross-Post History
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('admin_social_history');
                  }}
                  className="text-[10px] text-gray-500 hover:text-red-400 transition"
                >
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">
                No recent syndication activity recorded yet. When you publish to DEV.to or Medium, it will be logged here.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            log.platform === 'devto'
                              ? 'bg-gray-800 text-white'
                              : log.platform === 'medium'
                              ? 'bg-green-950 text-green-300'
                              : 'bg-blue-950 text-blue-300'
                          }`}
                        >
                          {log.platform}
                        </span>
                        <span className="text-[10px] text-gray-500">{log.timestamp}</span>
                      </div>
                      <p className="text-gray-300 truncate font-medium">{log.postTitle}</p>
                    </div>

                    {log.url && (
                      <a
                        href={log.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-indigo-400 hover:text-white transition"
                      >
                        <FaExternalLinkAlt className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
