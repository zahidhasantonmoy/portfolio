"use client";

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import PwaRegister from '@/components/PwaRegister';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PwaRegister />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#111827',
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}
