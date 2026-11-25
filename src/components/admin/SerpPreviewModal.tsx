'use client';

import React, { useState } from 'react';
import { FaTimes, FaDesktop, FaMobileAlt, FaGoogle, FaShareAlt, FaRobot } from 'react-icons/fa';

interface SerpPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  slug: string;
  coverImage?: string | null;
  publishDate?: string | null;
}

export default function SerpPreviewModal({
  isOpen,
  onClose,
  title,
  seoTitle,
  metaDescription,
  slug,
  coverImage,
  publishDate,
}: SerpPreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'google' | 'social'>('google');

  if (!isOpen) return null;

  const displayTitle = (seoTitle || title || 'Your Article Title').trim();
  const displayDesc = (
    metaDescription ||
    'Read this in-depth guide covering modern web development, software engineering best practices, and hands-on developer insights.'
  ).trim();
  const url = `https://zahidhasantonmoy.vercel.app/blog/${slug || 'your-article-slug'}`;
  const dateFormatted = publishDate
    ? new Date(publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Sep 21, 2026';

  const titleLength = displayTitle.length;
  const descLength = displayDesc.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-line-soft rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-line-soft flex items-center justify-between bg-bg/80">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-ink flex items-center gap-2">
              <FaGoogle className="text-red-500" />
              <span>Live SERP & Social Simulator</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-card p-1 rounded-lg border border-line-soft text-xs">
              <button
                onClick={() => setActiveTab('google')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeTab === 'google' ? 'bg-cyan-deep text-ink' : 'text-ink-mute hover:text-ink'
                }`}
              >
                Google Search
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeTab === 'social' ? 'bg-cyan-deep text-ink' : 'text-ink-mute hover:text-ink'
                }`}
              >
                Social Card
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-mute hover:text-ink hover:bg-card2 transition"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'google' ? (
            <div className="space-y-4">
              {/* Device Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-mute">
                  Google Search Snippet Preview
                </span>
                <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-line-soft text-xs">
                  <button
                    onClick={() => setDevice('desktop')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                      device === 'desktop' ? 'bg-card2 text-ink' : 'text-ink-mute'
                    }`}
                  >
                    <FaDesktop /> <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setDevice('mobile')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                      device === 'mobile' ? 'bg-card2 text-ink' : 'text-ink-mute'
                    }`}
                  >
                    <FaMobileAlt /> <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Google SERP Simulated Container */}
              <div
                className={`p-5 rounded-2xl bg-white text-gray-900 shadow-sm font-sans border border-gray-200 transition-all ${
                  device === 'mobile' ? 'max-w-[380px] mx-auto' : 'w-full'
                }`}
              >
                {/* SERP Breadcrumb */}
                <div className="flex items-center gap-2 mb-1.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-cyan-deep flex items-center justify-center text-ink text-[10px] font-bold">
                    Z
                  </div>
                  <div className="leading-none min-w-0">
                    <p className="text-[12px] text-[#202124] font-medium truncate">Zahid Hasan Tonmoy</p>
                    <p className="text-[10px] text-[#4d5156] truncate">{url}</p>
                  </div>
                </div>

                {/* SERP Title */}
                <h3 className="text-lg md:text-xl font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug line-clamp-2">
                  {displayTitle}
                </h3>

                {/* SERP Description Snippet */}
                <p className="text-xs md:text-sm text-[#4d5156] mt-1.5 leading-relaxed line-clamp-3">
                  <span className="text-[#70757a] font-medium">{dateFormatted} — </span>
                  {displayDesc}
                </p>
              </div>

              {/* Character Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-bg border border-line-soft rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-mute">Title Length:</span>
                    <span
                      className={`font-mono font-bold ${
                        titleLength > 60 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {titleLength} / 60 chars
                    </span>
                  </div>
                  <div className="w-full bg-card2 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${titleLength > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-bg border border-line-soft rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-mute">Meta Desc:</span>
                    <span
                      className={`font-mono font-bold ${
                        descLength > 160 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {descLength} / 160 chars
                    </span>
                  </div>
                  <div className="w-full bg-card2 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${descLength > 160 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Google AI Overview Preview */}
              <div className="p-4 rounded-xl bg-card2 border border-line space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan">
                  <FaRobot />
                  <span>Google AI Overview Citation Simulation</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">
                  &ldquo;According to software engineer <strong className="text-ink">Zahid Hasan Tonmoy</strong>, {displayDesc.slice(0, 120)}...&rdquo;
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan/20 text-cyan text-[11px] font-medium border border-cyan/30">
                  <span>Source: zahidhasantonmoy.vercel.app</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-mute block">
                OpenGraph & Social Share Preview (1200 × 630)
              </span>

              {/* Social Card Preview */}
              <div className="rounded-2xl border border-line bg-bg overflow-hidden shadow-sm max-w-lg mx-auto">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt={displayTitle} className="w-full h-56 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-card2 flex items-center justify-center p-6 text-center">
                    <span className="text-ink font-bold text-base leading-snug drop-shadow-sm">
                      {displayTitle}
                    </span>
                  </div>
                )}

                <div className="p-4 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider font-mono text-ink-mute">
                    zahidhasantonmoy.vercel.app
                  </p>
                  <h4 className="text-sm font-bold text-ink line-clamp-1">{displayTitle}</h4>
                  <p className="text-xs text-ink-mute line-clamp-2">{displayDesc}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line-soft bg-bg/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-card2 hover:bg-card2 text-ink text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
