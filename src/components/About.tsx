"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AboutProps {
  aboutMe: string;
}

const About = ({ aboutMe }: AboutProps) => {
  // Split text into lines for "code" feel, or just wrap it
  const bioLines = aboutMe.split('\n').filter(line => line.length > 0);

  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 transition-colors duration-300" style={{ background: 'var(--bg-base)' }}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-12 justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              About Me
              <span className="gradient-text">.ts</span>
            </h2>
          </div>

          {/* VS Code Window */}
          <div className="rounded-xl overflow-hidden shadow-2xl font-mono text-xs sm:text-sm md:text-base" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            {/* Window Header */}
            <div className="px-4 py-2 flex items-center gap-2" style={{ background: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-4 text-xs text-center flex-1" style={{ color: 'var(--text-secondary)' }}>
                zahid_portfolio.tsx
              </div>
            </div>

            {/* Editor Content */}
            <div className="p-3 sm:p-4 md:p-8 flex overflow-x-auto">
              {/* Line Numbers */}
              <div className="text-right pr-4 select-none mr-4 font-mono" style={{ color: 'var(--text-secondary)', borderRight: '1px solid var(--border)' }}>
                {Array.from({ length: 12 + bioLines.length }).map((_, i) => (
                  <div key={i} className="leading-relaxed">{i + 1}</div>
                ))}
              </div>

              {/* Code */}
              <div className="flex-1 leading-relaxed font-mono whitespace-pre-wrap break-words" style={{ color: 'var(--text-secondary)' }}>
                <div>
                  <span className="text-purple-400">const</span> <span style={{ color: 'var(--accent-primary)' }}>developer</span> <span style={{ color: 'var(--text-primary)' }}>=</span> <span className="text-yellow-400">{'{'}</span>
                </div>
                <div className="pl-4">
                  <span style={{ color: 'var(--accent-secondary)' }}>name</span>: <span className="text-[#ce9178]">"Zahid Hasan Tonmoy"</span>,
                </div>
                <div className="pl-4">
                  <span style={{ color: 'var(--accent-secondary)' }}>role</span>: <span className="text-[#ce9178]">"Web Developer & AI Enthusiast"</span>,
                </div>
                <div className="pl-4">
                  <span style={{ color: 'var(--accent-secondary)' }}>location</span>: <span className="text-[#ce9178]">"Dhaka, Bangladesh"</span>,
                </div>
                <div className="pl-4">
                  <span style={{ color: 'var(--accent-secondary)' }}>skills</span>: <span className="text-yellow-400">['React', 'Next.js', 'Python', 'AI Agents']</span>,
                </div>
                <div className="pl-4">
                  <span style={{ color: 'var(--accent-secondary)' }}>bio</span>: <span className="text-yellow-400">`</span>
                </div>
                {bioLines.map((line, idx) => (
                  <div key={idx} className="pl-8" style={{ color: 'var(--accent-primary)' }}>
                    {line}
                  </div>
                ))}
                <div className="pl-4">
                  <span className="text-yellow-400">`</span>,
                </div>
                <div className="pl-4">
                  <span style={{ color: 'var(--accent-secondary)' }}>contact</span>: <span className="text-[#ce9178]">"Via the paper plane below ✈️"</span>,
                </div>
                <div>
                  <span className="text-yellow-400">{'}'}</span>;
                </div>
                <br />
                <div>
                  <span className="text-purple-400">export default</span> <span style={{ color: 'var(--accent-primary)' }}>developer</span>;
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
