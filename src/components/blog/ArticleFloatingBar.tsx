'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiHandsClappingFill } from 'react-icons/pi';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaLink,
  FaCheck,
  FaArrowUp,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useBlogReader, MAX_CLAPS_PER_READER } from './BlogReaderContext';

interface ArticleFloatingBarProps {
  title: string;
  lang?: 'en' | 'bn';
}

/**
 * Sticky reading bar (desktop) / bottom bar (mobile): clap button, share
 * links (real navigator.share/share URLs), copy-link, font size, scroll
 * progress, back-to-top. Pure view over BlogReaderContext — likes and the
 * reader's claps (one 20-clap cap) are shared with BlogInteractions (fixes
 * B6). This is the sole share UI; no share count is shown (none exists).
 * R4-styled: --card / --line-soft / --cyan / --amber tokens.
 */
export default function ArticleFloatingBar({
  title,
  lang = 'en',
}: ArticleFloatingBarProps) {
  const { fontSize, increaseFontSize, decreaseFontSize, likes, userClaps, clap } =
    useBlogReader();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(typeof window !== 'undefined' ? window.location.href : '');

    // Track scroll progress
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClap = () => {
    const counted = clap();
    if (!counted) {
      toast(
        lang === 'bn'
          ? `সর্বোচ্চ ${MAX_CLAPS_PER_READER}টি হাততালি দিতে পারবেন!`
          : `Maximum ${MAX_CLAPS_PER_READER} claps reached!`,
        { icon: '👏' }
      );
      return;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      toast.success(lang === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Link copied to clipboard!', {
        icon: '🔗',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(lang === 'bn' ? 'কপি করা যায়নি' : 'Failed to copy link');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareLinks = [
    {
      name: 'Twitter / X',
      icon: <FaTwitter className="w-3.5 h-3.5" />,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      hoverColor: 'hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10',
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedinIn className="w-3.5 h-3.5" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      hoverColor: 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10',
    },
    {
      name: 'Facebook',
      icon: <FaFacebookF className="w-3.5 h-3.5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      hoverColor: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10',
    },
  ];

  return (
    <>
      {/* Desktop Sticky Floating Bar */}
      <aside
        aria-label="Reading actions"
        className="hidden md:flex flex-col items-center gap-4 py-4 px-2.5 rounded-2xl bg-[#0e1729] border-[1.5px] border-[#1a2947] shadow-sm sticky top-28 self-start w-16 select-none z-30 transition-all"
      >
        {/* Claps Button */}
        <div className="relative flex flex-col items-center">
          <motion.button
            onClick={handleClap}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              userClaps > 0
                ? 'bg-[#ffb02e]/15 text-[#ffb02e] border border-[#ffb02e]/40'
                : 'bg-[#122036] text-[#a9bedd] hover:text-[#ffb02e] hover:bg-[#ffb02e]/10 border border-transparent'
            }`}
            title={lang === 'bn' ? 'হাততালি দিন' : 'Applaud this post'}
          >
            <PiHandsClappingFill className={`text-xl ${userClaps > 0 ? 'scale-110' : ''}`} />
          </motion.button>

          <span className="text-[11px] font-bold text-[#c3d2ea] mt-1">
            {likes.toLocaleString()}
          </span>
        </div>

        <div className="w-8 h-[1px] bg-[#22345a] my-0.5" />

        {/* Font Size Adjusters */}
        <div className="flex flex-col items-center gap-1.5" title={lang === 'bn' ? 'ফন্ট সাইজ পরিবর্তন' : 'Adjust Text Size'}>
          <button
            onClick={increaseFontSize}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-[#a9bedd] hover:text-[#2fd8f2] hover:bg-[#2fd8f2]/10 transition border border-transparent hover:border-[#0e7d99]"
            title="Increase font size (A+)"
          >
            A+
          </button>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#a9bedd]">
            {fontSize}
          </span>
          <button
            onClick={decreaseFontSize}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#a9bedd] hover:text-[#2fd8f2] hover:bg-[#2fd8f2]/10 transition border border-transparent hover:border-[#0e7d99]"
            title="Decrease font size (A-)"
          >
            A-
          </button>
        </div>

        <div className="w-8 h-[1px] bg-[#22345a] my-0.5" />

        {/* Share Buttons */}
        <div className="flex flex-col items-center gap-2">
          {shareLinks.map((share) => (
            <a
              key={share.name}
              href={share.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-[#a9bedd] bg-[#122036] border border-[#22345a] transition-colors ${share.hoverColor}`}
              title={`Share on ${share.name}`}
            >
              {share.icon}
            </a>
          ))}

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#a9bedd] bg-[#122036] border border-[#22345a] hover:text-[#2fd8f2] hover:bg-[#2fd8f2]/10 transition-colors"
            title={lang === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy link'}
          >
            {copied ? (
              <FaCheck className="w-3.5 h-3.5 text-[#3ddc84]" />
            ) : (
              <FaLink className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="w-8 h-[1px] bg-[#22345a] my-0.5" />

        {/* Reading Progress & Scroll to Top */}
        <button
          onClick={scrollToTop}
          className="group relative w-10 h-10 rounded-full flex items-center justify-center text-[#a9bedd] hover:text-[#2fd8f2] transition"
          title={lang === 'bn' ? 'উপরে যান' : 'Scroll to top'}
        >
          {/* Circular progress SVG */}
          <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#22345a]"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#2fd8f2] transition-all duration-150"
              strokeDasharray={`${scrollProgress}, 100`}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute flex items-center justify-center">
            <FaArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </button>
      </aside>

      {/* Mobile Bottom Sticky Bar */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between px-4 py-2.5 rounded-full bg-[#0e1729] border-[1.5px] border-[#1a2947] shadow-sm">
        {/* Claps */}
        <button
          onClick={handleClap}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            userClaps > 0
              ? 'bg-[#ffb02e]/10 text-[#ffb02e]'
              : 'bg-[#122036] text-[#c3d2ea]'
          }`}
        >
          <PiHandsClappingFill className="text-base" />
          <span>{likes.toLocaleString()}</span>
        </button>

        {/* Font size toggle */}
        <div className="flex items-center gap-1 bg-[#122036] rounded-full px-2 py-1">
          <button
            onClick={decreaseFontSize}
            className="text-[11px] font-bold px-1.5 py-0.5 text-[#c3d2ea]"
          >
            A-
          </button>
          <span className="text-[10px] text-[#a9bedd] font-mono">|</span>
          <button
            onClick={increaseFontSize}
            className="text-[11px] font-bold px-1.5 py-0.5 text-[#c3d2ea]"
          >
            A+
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#122036] text-[#a9bedd]"
            title="Copy link"
          >
            {copied ? <FaCheck className="w-3 h-3 text-[#3ddc84]" /> : <FaLink className="w-3 h-3" />}
          </button>
          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#ffb02e] text-[#1a1200] shadow-sm"
            title="Back to top"
          >
            <FaArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
}
