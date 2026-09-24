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
    <div
      className="p-5 rounded-2xl backdrop-blur-sm shadow-sm border"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3.5 mb-3.5">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md">
            <div
              className="w-full h-full rounded-full flex items-center justify-center font-bold text-lg text-white"
              style={{ background: 'var(--bg-base)' }}
            >
              Z
            </div>
          </div>
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900"
            title="Online & Available for projects"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className="font-bold text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {isBn ? 'জাহিদ হাসান তন্ময়' : 'Zahid Hasan Tonmoy'}
          </h4>
          <p
            className="text-[11px] font-semibold truncate"
            style={{ color: 'var(--accent-primary)' }}
          >
            {isBn ? 'MERN & এআই এজেন্ট ডেভেলপার' : 'MERN & AI Agent Developer'}
          </p>
        </div>
      </div>

      <p
        className="text-xs leading-relaxed mb-4"
        style={{ color: 'var(--text-secondary)' }}
      >
        {isBn
          ? 'ওয়েব ডেভেলপমেন্ট, ফুল স্ট্যাক আর্কিটেকচার এবং এআই নিয়ে নিয়মিত টেক আর্টিকেল লিখছি।'
          : 'Full stack engineer building scalable web applications and exploring autonomous AI agents.'}
      </p>

      {/* Social Icons */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { href: 'https://github.com/zahidhasantonmoy', label: 'GitHub Profile', Icon: FaGithub, hoverColor: 'hover:text-blue-500 hover:border-blue-500' },
          { href: 'https://www.linkedin.com/in/zahidhasantonmoy/', label: 'LinkedIn Profile', Icon: FaLinkedin, hoverColor: 'hover:text-blue-500 hover:border-blue-500' },
          { href: 'https://medium.com/@zahidhasantonmoy', label: 'Medium Profile', Icon: FaMedium, hoverColor: 'hover:text-emerald-500 hover:border-emerald-500' },
          { href: 'https://dev.to/zahidhasantonmoy', label: 'DEV.to Profile', Icon: FaDev, hoverColor: 'hover:text-purple-500 hover:border-purple-500' },
        ].map(({ href, label, Icon, hoverColor }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${hoverColor}`}
            style={{
              background: 'var(--bg-base)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <Icon className="w-3.5 h-3.5" />
          </a>
        ))}
      </div>

      {/* CTA Button */}
      <Link
        href="/#contact"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        }}
      >
        <span>{isBn ? 'যোগাযোগ করুন / প্রজেক্ট' : "Let's Connect / Hire"}</span>
        <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-80" />
      </Link>
    </div>
  );
}
