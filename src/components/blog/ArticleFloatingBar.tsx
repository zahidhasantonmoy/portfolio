'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useBlogReader, FontSize } from './BlogReaderContext';

interface ArticleFloatingBarProps {
  slug: string;
  title: string;
  lang?: 'en' | 'bn';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  icon: string;
}

export default function ArticleFloatingBar({
  slug,
  title,
  lang = 'en',
}: ArticleFloatingBarProps) {
  const { fontSize, increaseFontSize, decreaseFontSize } = useBlogReader();
  const [likes, setLikes] = useState(0);
  const [userClaps, setUserClaps] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [url, setUrl] = useState('');

  const pendingClapsRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setUrl(typeof window !== 'undefined' ? window.location.href : '');

    // Fetch live stats
    fetch(`/api/blog/${slug}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.likes !== undefined) setLikes(data.likes);
      })
      .catch(() => {});

    // Load stored user claps
    try {
      const stored = localStorage.getItem(`claps_${slug}`);
      if (stored) {
        setUserClaps(parseInt(stored, 10));
      }
    } catch {}

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
  }, [slug]);

  const handleClap = () => {
    if (userClaps >= 25) {
      toast(lang === 'bn' ? 'সর্বোচ্চ ২৫টি হাততালি দিতে পারবেন!' : 'Maximum 25 claps reached!', {
        icon: '👏',
      });
      return;
    }

    const newClapCount = userClaps + 1;
    setUserClaps(newClapCount);
    setLikes((prev) => prev + 1);

    try {
      localStorage.setItem(`claps_${slug}`, String(newClapCount));
    } catch {}

    // Particle burst animation
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 45,
      y: -40 - Math.random() * 25,
      icon: ['👏', '❤️', '🔥', '✨'][Math.floor(Math.random() * 4)],
    };
    setParticles((prev) => [...prev.slice(-6), newParticle]);

    // Debounced API dispatch
    pendingClapsRef.current += 1;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const countToSend = pendingClapsRef.current;
      pendingClapsRef.current = 0;
      fetch(`/api/blog/${slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: countToSend }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.likes) setLikes(data.likes);
        })
        .catch(() => {});
    }, 600);
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
        className="hidden md:flex flex-col items-center gap-4 py-4 px-2.5 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 shadow-lg shadow-gray-200/40 dark:shadow-none sticky top-28 self-start w-16 select-none z-30 transition-all"
      >
        {/* Claps Button */}
        <div className="relative flex flex-col items-center">
          <motion.button
            onClick={handleClap}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              userClaps > 0
                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent'
            }`}
            title={lang === 'bn' ? 'হাততালি দিন' : 'Applaud this post'}
          >
            <PiHandsClappingFill className={`text-xl ${userClaps > 0 ? 'scale-110' : ''}`} />
          </motion.button>
          
          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-1">
            {likes.toLocaleString()}
          </span>

          {/* Particle animation */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <AnimatePresence>
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, scale: 0.8, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1.5, x: p.x, y: p.y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut' }}
                  className="absolute text-base font-bold"
                >
                  {p.icon}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800 my-0.5" />

        {/* Font Size Adjusters */}
        <div className="flex flex-col items-center gap-1.5" title={lang === 'bn' ? 'ফন্ট সাইজ পরিবর্তন' : 'Adjust Text Size'}>
          <button
            onClick={increaseFontSize}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
            title="Increase font size (A+)"
          >
            A+
          </button>
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 dark:text-gray-500">
            {fontSize}
          </span>
          <button
            onClick={decreaseFontSize}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
            title="Decrease font size (A-)"
          >
            A-
          </button>
        </div>

        <div className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800 my-0.5" />

        {/* Share Buttons */}
        <div className="flex flex-col items-center gap-2">
          {shareLinks.map((share) => (
            <a
              key={share.name}
              href={share.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 transition-colors ${share.hoverColor}`}
              title={`Share on ${share.name}`}
            >
              {share.icon}
            </a>
          ))}

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            title={lang === 'bn' ? 'লিঙ্ক কপি করুন' : 'Copy link'}
          >
            {copied ? (
              <FaCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <FaLink className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="w-8 h-[1px] bg-gray-200 dark:bg-gray-800 my-0.5" />

        {/* Reading Progress & Scroll to Top */}
        <button
          onClick={scrollToTop}
          className="group relative w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          title={lang === 'bn' ? 'উপরে যান' : 'Scroll to top'}
        >
          {/* Circular progress SVG */}
          <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200 dark:text-gray-800"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-indigo-600 dark:text-indigo-400 transition-all duration-150"
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
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between px-4 py-2.5 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/90 dark:border-gray-800 shadow-2xl">
        {/* Claps */}
        <button
          onClick={handleClap}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            userClaps > 0
              ? 'bg-rose-500/10 text-rose-500'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
          }`}
        >
          <PiHandsClappingFill className="text-base" />
          <span>{likes.toLocaleString()}</span>
        </button>

        {/* Font size toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
          <button
            onClick={decreaseFontSize}
            className="text-[11px] font-bold px-1.5 py-0.5 text-gray-600 dark:text-gray-300"
          >
            A-
          </button>
          <span className="text-[10px] text-gray-400 font-mono">|</span>
          <button
            onClick={increaseFontSize}
            className="text-[11px] font-bold px-1.5 py-0.5 text-gray-600 dark:text-gray-300"
          >
            A+
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            title="Copy link"
          >
            {copied ? <FaCheck className="w-3 h-3 text-emerald-500" /> : <FaLink className="w-3 h-3" />}
          </button>
          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600 text-white shadow-sm"
            title="Back to top"
          >
            <FaArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
}
