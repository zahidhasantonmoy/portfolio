'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ResumeChatBot from '@/components/ResumeChatBot';

export function ClientNavbar() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <Navbar />;
}

export function ClientFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <Footer />;
}

export function ClientChatBot() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <ResumeChatBot />;
}
