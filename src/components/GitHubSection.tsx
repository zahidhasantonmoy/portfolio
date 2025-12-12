"use client";
import React from 'react';
import { motion } from 'framer-motion';

const weeks = 20;
const days = 7;

// Generate fake contribution data
const contributionData = Array.from({ length: weeks * days }).map(() => Math.floor(Math.random() * 4));

const GitHubSection = () => {
  return (
    <section id="github" className="py-24 bg-[#0d1117] overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Neural Activity
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Visualizing code frequency & commit history</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">

          {/* Holographic Skyline Container */}
          <div className="perspective-1000 w-full max-w-3xl">
            <motion.div
              className="relative transform-style-3d rotate-x-60 rotate-z-45"
              initial={{ rotateX: 60, scale: 0.8, opacity: 0 }}
              whileInView={{ rotateX: 45, scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="grid grid-cols-20 gap-1 w-full h-full">
                {/* We can't actually do grid-cols-20 easily with tailwind default, using flex wrap or custom css is better.
                            Let's use a simpler flex wrap with fixed blocks for the visual effect.
                         */}
                <div className="flex flex-wrap gap-[4px] justify-center shadow-2xl bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                  {contributionData.map((level, i) => {
                    const heightMap = [4, 12, 24, 40]; // Base heights
                    const colors = ['bg-gray-800', 'bg-cyan-900', 'bg-cyan-600', 'bg-cyan-400'];
                    const glows = ['', 'shadow-[0_0_5px_rgba(22,78,99,0.5)]', 'shadow-[0_0_10px_rgba(8,145,178,0.6)]', 'shadow-[0_0_15px_rgba(34,211,238,0.8)]'];
                    return (
                      <motion.div
                        key={i}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${colors[level]} ${glows[level]}`}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: i * 0.005, // Staggered rain effect
                          type: 'spring',
                          stiffness: 100
                        }}
                        style={{
                          height: `${heightMap[level]}px`,
                          transformOrigin: 'bottom'
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Reflection/Ground Glow */}
            <div className="absolute -bottom-20 left-0 right-0 h-40 bg-cyan-500/10 blur-[100px] pointer-events-none" />
          </div>

          {/* Stats Card - Glassmorphism */}
          <motion.div
            className="w-full lg:w-1/3"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-8 rounded-2xl shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  </div>
                </div>
                <a href="https://github.com/zahidhasantonmoy" target="_blank" className="text-cyan-400 hover:text-cyan-300 font-mono text-sm border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition-colors">
                  @zahidhasantonmoy
                </a>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4">
                  <span className="text-gray-400">Total Commits</span>
                  <span className="text-2xl font-bold text-white">1,248</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4">
                  <span className="text-gray-400">Active Days</span>
                  <span className="text-2xl font-bold text-white">214<span className="text-sm text-gray-500 font-normal">/365</span></span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Longest Streak</span>
                  <span className="text-2xl font-bold text-cyan-400">14 Days 🔥</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-6">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-sm bg-gray-800" />
                    <span className="w-3 h-3 rounded-sm bg-cyan-900" />
                    <span className="w-3 h-3 rounded-sm bg-cyan-600" />
                    <span className="w-3 h-3 rounded-sm bg-cyan-400" />
                  </div>
                  <span>More</span>
                </div>

                <a
                  href="https://github.com/zahidhasantonmoy"
                  target="_blank"
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all transform hover:scale-[1.02]"
                >
                  Visit My GitHub 🚀
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GitHubSection;
