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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-gray-800 flex items-center justify-between bg-gray-950/80">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-white flex items-center gap-2">
              <FaGoogle className="text-red-500" />
              <span>Live SERP & Social Simulator</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
              <button
                onClick={() => setActiveTab('google')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeTab === 'google' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Google Search
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  activeTab === 'social' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Social Card
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
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
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Google Search Snippet Preview
                </span>
                <div className="flex items-center gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800 text-xs">
                  <button
                    onClick={() => setDevice('desktop')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                      device === 'desktop' ? 'bg-gray-800 text-white' : 'text-gray-400'
                    }`}
                  >
                    <FaDesktop /> <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setDevice('mobile')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                      device === 'mobile' ? 'bg-gray-800 text-white' : 'text-gray-400'
                    }`}
                  >
                    <FaMobileAlt /> <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Google SERP Simulated Container */}
              <div
                className={`p-5 rounded-2xl bg-white text-gray-900 shadow-md font-sans border border-gray-200 transition-all ${
                  device === 'mobile' ? 'max-w-[380px] mx-auto' : 'w-full'
                }`}
              >
                {/* SERP Breadcrumb */}
                <div className="flex items-center gap-2 mb-1.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
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
                <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Title Length:</span>
                    <span
                      className={`font-mono font-bold ${
                        titleLength > 60 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {titleLength} / 60 chars
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${titleLength > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, (titleLength / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Meta Desc:</span>
                    <span
                      className={`font-mono font-bold ${
                        descLength > 160 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {descLength} / 160 chars
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${descLength > 160 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, (descLength / 160) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Google AI Overview Preview */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-pink-950/20 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <FaRobot />
                  <span>Google AI Overview Citation Simulation</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  &ldquo;According to software engineer <strong className="text-white">Zahid Hasan Tonmoy</strong>, {displayDesc.slice(0, 120)}...&rdquo;
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-medium border border-indigo-500/30">
                  <span>Source: zahidhasantonmoy.vercel.app</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                OpenGraph & Social Share Preview (1200 × 630)
              </span>

              {/* Social Card Preview */}
              <div className="rounded-2xl border border-gray-700 bg-gray-950 overflow-hidden shadow-xl max-w-lg mx-auto">
                {coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt={displayTitle} className="w-full h-56 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6 text-center">
                    <span className="text-white font-bold text-base leading-snug drop-shadow-md">
                      {displayTitle}
                    </span>
                  </div>
                )}

                <div className="p-4 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider font-mono text-gray-400">
                    zahidhasantonmoy.vercel.app
                  </p>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{displayTitle}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2">{displayDesc}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
