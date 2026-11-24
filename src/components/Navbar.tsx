'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAudio } from '@/hooks/useAudio';

/* Redesign 4 — floating glass dock nav.
   Anchors use /#… so they work from non-home pages too.
   Visibility is pure CSS (.hide-m ≥900px, .hide-s ≥640px):
   phone dock shows only Work / Blog / Hire me. */
const navigation = [
  { name: 'Work', href: '/#work', className: '' },
  { name: 'Services', href: '/#services', className: 'hide-m' },
  { name: 'Skills', href: '/#skills', className: 'hide-m' },
  { name: 'Story', href: '/#story', className: 'hide-m' },
  { name: 'Blog', href: '/blog', className: '' },
  { name: 'Ask AI', href: '/#ask', className: 'hide-s' },
  { name: 'Hire me', href: '/#contact', className: 'dock-hire' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { playClick, playHover } = useAudio();

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    playClick();

    // On the home page, smooth-scroll to the section instead of reloading.
    if (pathname === '/') {
      if (href.startsWith('/#')) {
        e.preventDefault();
        const id = href.replace('/#', '');
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', href.replace('/', ''));
        }
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      aria-label="Main navigation"
      className="dock"
    >
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={item.className || undefined}
          onMouseEnter={() => playHover()}
          onClick={(e) => handleNavClick(e, item.href)}
        >
          {item.name}
        </Link>
      ))}
    </motion.nav>
  );
}
