'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye } from 'react-icons/fa';
import { PiHandsClappingFill } from 'react-icons/pi';
import { useBlogReader } from './BlogReaderContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  icon: string;
}

/**
 * Views badge + clap button. Pure view over BlogReaderContext — likes, views
 * and the reader's claps (one 20-clap cap) are shared with ArticleFloatingBar
 * and the second BlogInteractions instance on the page (fixes B6).
 * R4-styled: --card / --line-soft / --cyan / --amber tokens.
 */
export default function BlogInteractions() {
  const { likes, views, userClaps, clap } = useBlogReader();
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleClap = () => {
    const counted = clap();
    if (!counted) return;

    // Particle burst (visual only — the count lives in context)
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 50,
      y: -50 - Math.random() * 30,
      icon: ['👏', '❤️', '🔥', '✨'][Math.floor(Math.random() * 4)],
    };
    setParticles((prev) => [...prev.slice(-8), newParticle]);
  };

  return (
    <div className="flex items-center gap-4 select-none">
      {/* Views count badge */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#122036] border-[1.5px] border-[#1a2947] text-xs font-medium text-[#a9bedd]">
        <FaEye className="text-[#2fd8f2] text-sm" />
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
              ? 'bg-[#ffb02e]/10 border-[#ffb02e]/40 text-[#ffb02e]'
              : 'bg-[#122036] border-[#1a2947] text-[#c3d2ea] hover:border-[#0e7d99]'
          }`}
          aria-label="Applaud this post"
        >
          <PiHandsClappingFill
            className={`text-base transition-transform ${
              userClaps > 0 ? 'text-[#ffb02e] scale-110' : 'text-[#a9bedd]'
            }`}
          />
          <span>{likes.toLocaleString()}</span>
          {userClaps > 0 && (
            <span className="text-[10px] bg-[#ffb02e] text-[#1a1200] rounded-full px-1.5 py-0.5 font-bold ml-0.5">
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
