'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ThemeSwitcher from './ThemeSwitcher';
import MagneticButton from './MagneticButton';
import { useAudio } from '@/hooks/useAudio';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/#about' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Contact', href: '/#contact' },
  { name: 'Blog', href: '/blog' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { playClick, playHover } = useAudio();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    playClick();
    setIsOpen(false);

    if (pathname === '/') {
      if (href === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href.startsWith('/#')) {
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
      className={`fixed w-full z-50 transition-all duration-500 ${scrolled
        ? 'bg-[var(--bg-surface)]/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-[var(--border)]'
        : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <MagneticButton>
            <Link
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              onMouseEnter={() => playHover()}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 cursor-pointer"
              >
                <span className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                  Zahid Hasan Tonmoy
                </span>
              </motion.div>
            </Link>
          </MagneticButton>


          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navigation.map((item) => (
                <MagneticButton key={item.name}>
                  <Link
                    href={item.href}
                    className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm font-medium inline-block transition-colors duration-200 hover:bg-[var(--bg-surface-hover)]"
                    onMouseEnter={() => playHover()}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <motion.span whileHover={{ scale: 1.05 }} className="inline-block">
                      {item.name}
                    </motion.span>
                  </Link>
                </MagneticButton>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeSwitcher />

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        className={`${isOpen ? 'block' : 'hidden'} md:hidden`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-3 pt-2 pb-4 space-y-1 bg-[var(--bg-surface)]/95 backdrop-blur-xl shadow-xl border-b border-[var(--border)]">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] block px-3 py-2.5 rounded-lg text-base font-medium transition active:scale-95"
            >
              <motion.span whileHover={{ scale: 1.05 }} className="block">
                {item.name}
              </motion.span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
} 