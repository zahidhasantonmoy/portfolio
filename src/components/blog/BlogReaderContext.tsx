'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface BlogReaderContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const BlogReaderContext = createContext<BlogReaderContextType | undefined>(undefined);

const FONT_SIZES: FontSize[] = ['sm', 'base', 'lg', 'xl'];

export function BlogReaderProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>('lg');

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

  return (
    <BlogReaderContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </BlogReaderContext.Provider>
  );
}

export function useBlogReader() {
  const ctx = useContext(BlogReaderContext);
  if (!ctx) {
    return {
      fontSize: 'lg' as FontSize,
      setFontSize: () => {},
      increaseFontSize: () => {},
      decreaseFontSize: () => {},
    };
  }
  return ctx;
}
