'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaHeart } from 'react-icons/fa';
import { PiHandsClappingFill } from 'react-icons/pi';

interface BlogInteractionsProps {
  slug: string;
  initialLikes?: number;
  initialViews?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  icon: string;
}

export default function BlogInteractions({
  slug,
  initialLikes = 0,
  initialViews = 0,
}: BlogInteractionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [userClaps, setUserClaps] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const pendingClapsRef = useRef(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load stats and record view on mount
  useEffect(() => {
    // 1. Fetch live stats
    fetch(`/api/blog/${slug}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.views !== undefined) setViews(data.views);
        if (data.likes !== undefined) setLikes(data.likes);
      })
      .catch(() => {});

    // 2. Increment view once per session
    const viewedKey = `viewed_post_${slug}`;
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, '1');
      fetch(`/api/blog/${slug}/view`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.views) setViews(data.views);
        })
        .catch(() => {});
    }

    // 3. Load user's previous claps
    const storedClaps = localStorage.getItem(`claps_${slug}`);
    if (storedClaps) {
      setUserClaps(parseInt(storedClaps, 10));
    }
  }, [slug]);

  const handleClap = () => {
    if (userClaps >= 20) return; // max 20 claps per reader

    const newClapCount = userClaps + 1;
    setUserClaps(newClapCount);
    setLikes((prev) => prev + 1);
    localStorage.setItem(`claps_${slug}`, String(newClapCount));

    // Particle burst
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 50,
      y: -50 - Math.random() * 30,
      icon: ['👏', '❤️', '🔥', '✨'][Math.floor(Math.random() * 4)],
    };
    setParticles((prev) => [...prev.slice(-8), newParticle]);

    // Debounce network call
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

  return (
    <div className="flex items-center gap-4 select-none">
      {/* Views count badge */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 text-xs font-medium text-gray-600 dark:text-gray-300">
        <FaEye className="text-gray-400 dark:text-gray-400 text-sm" />
        <span>{views.toLocaleString()} views</span>
      </div>

      {/* Clapper / Like button */}
      <div className="relative">
        <motion.button
          onClick={handleClap}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition shadow-sm border ${
            userClaps > 0
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-gray-100 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 hover:border-rose-400/50'
          }`}
          aria-label="Applaud this post"
        >
          <PiHandsClappingFill
            className={`text-base transition-transform ${
              userClaps > 0 ? 'text-rose-500 scale-110' : 'text-gray-500'
            }`}
          />
          <span>{likes.toLocaleString()}</span>
          {userClaps > 0 && (
            <span className="text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0.2 font-bold ml-0.5">
              +{userClaps}
            </span>
          )}
        </motion.button>

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ opacity: 1, scale: 0.8, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 1.4, x: p.x, y: p.y }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute text-lg font-bold"
              >
                {p.icon}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
