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
    <section id="about" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-12 justify-center">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
              About Me
              <span className="text-blue-500">.ts</span>
            </h2>
          </div>

          {/* VS Code Window */}
          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-gray-700 font-mono text-sm md:text-base">
            {/* Window Header */}
            <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-4 text-gray-400 text-xs text-center flex-1">
                zahid_portfolio.tsx
              </div>
            </div>

            {/* Editor Content */}
            <div className="p-4 md:p-8 flex overflow-x-auto">
              {/* Line Numbers */}
              <div className="text-gray-500 text-right pr-4 select-none border-r border-gray-700 mr-4 font-mono">
                {Array.from({ length: 12 + bioLines.length }).map((_, i) => (
                  <div key={i} className="leading-relaxed">{i + 1}</div>
                ))}
              </div>

              {/* Code */}
              <div className="flex-1 text-gray-300 leading-relaxed font-mono whitespace-pre-wrap break-words">
                <div>
                  <span className="text-purple-400">const</span> <span className="text-blue-400">developer</span> <span className="text-white">=</span> <span className="text-yellow-400">{'{'}</span>
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">name</span>: <span className="text-[#ce9178]">"Zahid Hasan Tonmoy"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">role</span>: <span className="text-[#ce9178]">"Web Developer & AI Enthusiast"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">location</span>: <span className="text-[#ce9178]">"Dhaka, Bangladesh"</span>,
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">skills</span>: <span className="text-yellow-400">['React', 'Next.js', 'Python', 'AI Agents']</span>,
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">bio</span>: <span className="text-yellow-400">`</span>
                </div>
                {bioLines.map((line, idx) => (
                  <div key={idx} className="pl-8 text-[#9cdcfe]">
                    {line}
                  </div>
                ))}
                <div className="pl-4">
                  <span className="text-yellow-400">`</span>,
                </div>
                <div className="pl-4">
                  <span className="text-blue-300">contact</span>: <span className="text-[#ce9178]">"Via the paper plane below ✈️"</span>,
                </div>
                <div>
                  <span className="text-yellow-400">{'}'}</span>;
                </div>
                <br />
                <div>
                  <span className="text-purple-400">export default</span> <span className="text-blue-400">developer</span>;
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
