"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DayContribution {
  date: string;
  count: number;
  level: number;
}

interface GitHubStats {
  totalContributions: number;
  activeDays: number;
  totalDays: number;
  longestStreak: number;
  currentStreak: number;
  contributions: DayContribution[];
  source: "live" | "cached" | "fallback";
}

const heightMap = [4, 10, 18, 28, 40];
const colors = [
  "bg-gray-800/80 hover:bg-gray-700",
  "bg-cyan-950 border border-cyan-800/40 hover:bg-cyan-900",
  "bg-cyan-700 hover:bg-cyan-600",
  "bg-cyan-500 hover:bg-cyan-400",
  "bg-cyan-300 hover:bg-cyan-200",
];
const glows = [
  "",
  "shadow-[0_0_5px_rgba(22,78,99,0.4)]",
  "shadow-[0_0_10px_rgba(8,145,178,0.6)]",
  "shadow-[0_0_15px_rgba(34,211,238,0.8)]",
  "shadow-[0_0_20px_rgba(103,232,249,1)]",
];

const GitHubSection = () => {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayContribution | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch("/api/github-stats");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStats(data);
        }
      } catch (err) {
        console.warn("Failed to fetch live GitHub stats:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Default / placeholder fallback contributions if still loading
  const displayContributions: DayContribution[] =
    stats?.contributions && stats.contributions.length > 0
      ? stats.contributions
      : Array.from({ length: 140 }).map((_, i) => ({
          date: `Day ${i + 1}`,
          count: i % 4 === 0 ? 3 : i % 3 === 0 ? 1 : 0,
          level: i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0,
        }));

  const totalCommitsDisplay = stats ? stats.totalContributions.toLocaleString() : "924+";
  const activeDaysDisplay = stats ? stats.activeDays : "218";
  const longestStreakDisplay = stats ? `${stats.longestStreak} Days 🔥` : "18 Days 🔥";
  const currentStreakDisplay = stats ? `${stats.currentStreak} Days ⚡` : "4 Days ⚡";

  return (
    <section id="github" className="py-24 overflow-hidden relative" style={{ background: 'var(--bg-base)' }}>
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Live Sync with GitHub (@zahidhasantonmoy)
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              Neural Activity
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Visualizing real-time code frequency & commit history</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
          {/* Holographic Skyline Container */}
          <div className="perspective-1000 w-full max-w-3xl flex flex-col items-center">
            {/* Live Hover Tooltip */}
            <div className="h-8 mb-2 flex items-center justify-center">
              {hoveredDay ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-900/90 border border-cyan-500/40 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 shadow-lg shadow-cyan-500/20"
                >
                  <span className="font-bold text-white">{hoveredDay.count} commits</span> on{" "}
                  {new Date(hoveredDay.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </motion.div>
              ) : (
                <span className="text-xs font-mono text-gray-500">
                  Hover over neural nodes to view daily commit counts
                </span>
              )}
            </div>

            <motion.div
              className="relative transform-style-3d rotate-x-60 rotate-z-45"
              initial={{ rotateX: 60, scale: 0.8, opacity: 0 }}
              whileInView={{ rotateX: 45, scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="grid grid-cols-20 gap-1 w-full h-full">
                <div className="flex flex-wrap gap-[4px] justify-center shadow-2xl bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm max-w-[620px]">
                  {displayContributions.map((item, i) => {
                    const level = Math.min(4, Math.max(0, item.level || 0));
                    return (
                      <motion.div
                        key={`${item.date}-${i}`}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-sm cursor-pointer transition-colors duration-150 ${colors[level]} ${glows[level]}`}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        onMouseEnter={() => setHoveredDay(item)}
                        onMouseLeave={() => setHoveredDay(null)}
                        transition={{
                          duration: 0.4,
                          delay: Math.min(i * 0.004, 0.6),
                          type: "spring",
                          stiffness: 120,
                        }}
                        style={{
                          height: `${heightMap[level]}px`,
                          transformOrigin: "bottom",
                        }}
                      />
                    );
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
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="backdrop-blur-xl p-8 rounded-2xl shadow-xl relative overflow-hidden group" style={{ background: 'rgba(19, 25, 38, 0.6)', border: '1px solid var(--border)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                </div>
                <a
                  href="https://github.com/zahidhasantonmoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-mono text-sm border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition-colors"
                >
                  @zahidhasantonmoy
                </a>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4">
                  <span className="text-gray-400">Total Commits (Year)</span>
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {isLoading ? (
                      <span className="inline-block w-16 h-6 bg-gray-700 animate-pulse rounded" />
                    ) : (
                      totalCommitsDisplay
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4">
                  <span className="text-gray-400">Active Days</span>
                  <span className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <span className="inline-block w-16 h-6 bg-gray-700 animate-pulse rounded" />
                    ) : (
                      <>
                        {activeDaysDisplay}
                        <span className="text-sm text-gray-500 font-normal">/365</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4">
                  <span className="text-gray-400">Longest Streak</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {isLoading ? (
                      <span className="inline-block w-20 h-6 bg-gray-700 animate-pulse rounded" />
                    ) : (
                      longestStreakDisplay
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Streak</span>
                  <span className="text-xl font-bold text-emerald-400">
                    {isLoading ? (
                      <span className="inline-block w-16 h-6 bg-gray-700 animate-pulse rounded" />
                    ) : (
                      currentStreakDisplay
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-6">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-sm bg-gray-800" />
                    <span className="w-3 h-3 rounded-sm bg-cyan-950 border border-cyan-800/40" />
                    <span className="w-3 h-3 rounded-sm bg-cyan-700" />
                    <span className="w-3 h-3 rounded-sm bg-cyan-500" />
                    <span className="w-3 h-3 rounded-sm bg-cyan-300" />
                  </div>
                  <span>More</span>
                </div>

                <a
                  href="https://github.com/zahidhasantonmoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-xl text-white font-bold hover:shadow-glow-sm transition-all transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
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
