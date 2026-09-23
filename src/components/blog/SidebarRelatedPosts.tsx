'use client';

import React from 'react';
import Link from 'next/link';
import type { Post } from '@/types/blog';
import { FaBookOpen, FaClock } from 'react-icons/fa';

interface SidebarRelatedPostsProps {
  posts: Post[];
  lang?: 'en' | 'bn';
}

export default function SidebarRelatedPosts({
  posts,
  lang = 'en',
}: SidebarRelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  const isBn = lang === 'bn';
  // Take up to 3 posts for the sidebar
  const displayPosts = posts.slice(0, 3);

  return (
    <div
      className="p-5 rounded-2xl backdrop-blur-sm shadow-sm border"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div
        className="flex items-center gap-2 pb-3 mb-3 border-b text-xs font-bold uppercase tracking-wider"
        style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <FaBookOpen className="text-blue-500" />
        <span>{isBn ? 'সম্পর্কিত অন্যান্য পোস্ট' : 'Related Articles'}</span>
      </div>

      <div className="space-y-3">
        {displayPosts.map((post) => {
          const title = isBn && post.title_bn ? post.title_bn : post.title_en;
          const href = isBn ? `/bn/blog/${post.slug}` : `/blog/${post.slug}`;
          const catName = isBn && post.categories?.name_bn ? post.categories.name_bn : post.categories?.name_en;

          return (
            <Link
              key={post.id}
              href={href}
              className="group block p-2.5 rounded-xl border border-transparent hover:border-border transition-all"
              style={{ background: 'transparent' }}
            >
              {catName && (
                <span
                  className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5"
                  style={{
                    backgroundColor: post.categories?.color ? `${post.categories.color}20` : 'rgba(59, 130, 246, 0.1)',
                    color: post.categories?.color || 'var(--accent-primary)',
                  }}
                >
                  {catName}
                </span>
              )}
              <h5
                className="text-xs font-semibold group-hover:text-blue-500 transition-colors line-clamp-2 leading-snug"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h5>
              <div className="flex items-center gap-1.5 mt-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <FaClock className="w-2.5 h-2.5 opacity-70" />
                <span>{post.read_time_min} {isBn ? 'মিনিট' : 'min read'}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
