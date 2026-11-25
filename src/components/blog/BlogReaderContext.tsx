'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';

/** One cap for every clap widget on the page (fixes B6: 20 vs 25 divergence). */
export const MAX_CLAPS_PER_READER = 20;

interface BlogReaderContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  /** Shared engagement state — single source of truth for every clap widget. */
  likes: number;
  views: number;
  userClaps: number;
  maxClaps: number;
  /** Adds one clap if the reader is under the cap. Returns false at the cap. */
  clap: () => boolean;
}

const BlogReaderContext = createContext<BlogReaderContextType | undefined>(undefined);

const FONT_SIZES: FontSize[] = ['sm', 'base', 'lg', 'xl'];

export function BlogReaderProvider({
  children,
  slug,
}: {
  children: React.ReactNode;
  /** Article slug — when given, the provider owns likes/views/clap state. */
  slug?: string;
}) {
  const [fontSize, setFontSizeState] = useState<FontSize>('lg');
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [userClaps, setUserClaps] = useState(0);
  const userClapsRef = useRef(0);
  const pendingClapsRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('blog_reader_font_size') as FontSize;
      if (saved && FONT_SIZES.includes(saved)) {
        setFontSizeState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  // Engagement: one stats fetch, one once-per-session view, one clap store —
  // shared by BlogInteractions (×2) and ArticleFloatingBar (B6).
  useEffect(() => {
    if (!slug) return;

    // 1. Fetch live stats
    fetch(`/api/blog/${slug}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.views !== undefined) setViews(data.views);
        if (data.likes !== undefined) setLikes(data.likes);
      })
      .catch(() => {});

    // 2. Increment view once per session
    try {
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
    } catch {
      // sessionStorage unavailable — skip the view record
    }

    // 3. Load the reader's previous claps
    try {
      const storedClaps = localStorage.getItem(`claps_${slug}`);
      if (storedClaps) {
        const n = parseInt(storedClaps, 10);
        if (!Number.isNaN(n)) {
          userClapsRef.current = n;
          setUserClaps(n);
        }
      }
    } catch {
      // ignore
    }

    // On unmount, flush any claps still waiting in the debounce window.
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (pendingClapsRef.current > 0) {
        const countToSend = pendingClapsRef.current;
        pendingClapsRef.current = 0;
        fetch(`/api/blog/${slug}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: countToSend }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [slug]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    try {
      localStorage.setItem('blog_reader_font_size', size);
    } catch {
      // ignore
    }
  };

  const increaseFontSize = () => {
    const idx = FONT_SIZES.indexOf(fontSize);
    if (idx < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[idx + 1]);
    }
  };

  const decreaseFontSize = () => {
    const idx = FONT_SIZES.indexOf(fontSize);
    if (idx > 0) {
      setFontSize(FONT_SIZES[idx - 1]);
    }
  };

  const clap = useCallback((): boolean => {
    if (!slug) return false;
    if (userClapsRef.current >= MAX_CLAPS_PER_READER) return false;

    const newClapCount = userClapsRef.current + 1;
    userClapsRef.current = newClapCount;
    setUserClaps(newClapCount);
    setLikes((prev) => prev + 1);
    try {
      localStorage.setItem(`claps_${slug}`, String(newClapCount));
    } catch {
      // ignore
    }

    // Debounced POST — claps are sent in one request per burst.
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

    return true;
  }, [slug]);

  return (
    <BlogReaderContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        likes,
        views,
        userClaps,
        maxClaps: MAX_CLAPS_PER_READER,
        clap,
      }}
    >
      {children}
    </BlogReaderContext.Provider>
  );
}

export function useBlogReader(): BlogReaderContextType {
  const ctx = useContext(BlogReaderContext);
  if (!ctx) {
    // Outside a provider (e.g. ArticleContent on journal/case-study pages):
    // font size still works, engagement is a harmless no-op.
    return {
      fontSize: 'lg' as FontSize,
      setFontSize: () => {},
      increaseFontSize: () => {},
      decreaseFontSize: () => {},
      likes: 0,
      views: 0,
      userClaps: 0,
      maxClaps: MAX_CLAPS_PER_READER,
      clap: () => false,
    };
  }
  return ctx;
}
