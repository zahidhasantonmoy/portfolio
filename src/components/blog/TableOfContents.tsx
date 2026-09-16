'use client';

import React, { useEffect, useState } from 'react';
import { FaListUl } from 'react-icons/fa';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  lang?: 'en' | 'bn';
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export default function TableOfContents({ content, lang = 'en' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse ## and ### headings from markdown
    const lines = content.split('\n');
    const items: TocItem[] = [];

    for (const line of lines) {
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();
        // Remove markdown formatting like bold, links, code
        const cleanText = rawText
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          .replace(/`([^`]+)`/g, '$1');

        items.push({
          id: slugify(cleanText),
          text: cleanText,
          level,
        });
      }
    }

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0px 0px -65% 0px', threshold: 0.1 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-850/80 border border-gray-200/80 dark:border-gray-800 backdrop-blur-sm shadow-sm"
    >
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-200 dark:border-gray-800 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <FaListUl className="text-indigo-500" />
        <span>{lang === 'bn' ? 'সূচিপত্র' : 'Table of Contents'}</span>
      </div>

      <ul className="space-y-2 text-xs">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              style={{ paddingLeft: item.level === 3 ? '14px' : '0px' }}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.id);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveId(item.id);
                    history.pushState(null, '', `#${item.id}`);
                  }
                }}
                className={`block py-1 leading-snug transition-colors line-clamp-2 ${
                  isActive
                    ? 'font-bold text-indigo-600 dark:text-indigo-400 pl-2 border-l-2 border-indigo-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
