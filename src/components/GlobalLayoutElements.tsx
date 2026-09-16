'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ResumeChatBot = dynamic(() => import('@/components/ResumeChatBot'), {
  ssr: false,
});

const ResumeLeadDrawer = dynamic(() => import('@/components/ResumeLeadDrawer'), {
  ssr: false,
});

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

export function ClientResumeLeadDrawer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <ResumeLeadDrawer />;
}
