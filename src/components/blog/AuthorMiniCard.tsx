'use client';

import React from 'react';
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaMedium, FaDev, FaExternalLinkAlt } from 'react-icons/fa';

interface AuthorMiniCardProps {
  lang?: 'en' | 'bn';
}

export default function AuthorMiniCard({ lang = 'en' }: AuthorMiniCardProps) {
  const isBn = lang === 'bn';

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-gray-50/90 to-white dark:from-gray-850/90 dark:to-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3.5 mb-3.5">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
              Z
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" title="Online & Available for projects" />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
            {isBn ? 'জাহিদ হাসান তন্ময়' : 'Zahid Hasan Tonmoy'}
          </h4>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
            {isBn ? 'MERN & এআই এজেন্ট ডেভেলপার' : 'MERN & AI Agent Developer'}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
        {isBn
          ? 'ওয়েব ডেভেলপমেন্ট, ফুল স্ট্যাক আর্কিটেকচার এবং এআই নিয়ে নিয়মিত টেক আর্টিকেল লিখছি।'
          : 'Full stack engineer building scalable web applications and exploring autonomous AI agents.'}
      </p>

      {/* Social Icons */}
      <div className="flex items-center gap-2 mb-4">
        <a
          href="https://github.com/zahidhasantonmoy"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
        >
          <FaGithub className="w-3.5 h-3.5" />
        </a>
        <a
          href="https://www.linkedin.com/in/zahidhasantonmoy/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <FaLinkedin className="w-3.5 h-3.5" />
        </a>
        <a
          href="https://medium.com/@zahidhasantonmoy"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Medium Profile"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
        >
          <FaMedium className="w-3.5 h-3.5" />
        </a>
        <a
          href="https://dev.to/zahidhasantonmoy"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="DEV.to Profile"
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
        >
          <FaDev className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* CTA Button */}
      <Link
        href="/#contact"
        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all hover:shadow-indigo-500/20 active:scale-95"
      >
        <span>{isBn ? 'যোগাযোগ করুন / প্রজেক্ট' : "Let's Connect / Hire"}</span>
        <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-80" />
      </Link>
    </div>
  );
}
