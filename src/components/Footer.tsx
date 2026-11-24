"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFacebook, FaTwitter, FaMedium, FaDev, FaCoffee } from 'react-icons/fa';
import NewsletterSection from './NewsletterSection';

/* Redesign 4 footer: big Unbounded name, foot-row links, © 2026 line. */
const socials = [
  { href: 'https://github.com/zahidhasantonmoy', label: 'GitHub profile', Icon: FaGithub },
  { href: 'https://www.linkedin.com/in/zahidhasantonmoy/', label: 'LinkedIn profile', Icon: FaLinkedin },
  { href: 'https://www.facebook.com/zahidhasantonmoybd', label: 'Facebook profile', Icon: FaFacebook },
  { href: 'https://x.com/zahidhasan_bd', label: 'Twitter / X profile', Icon: FaTwitter },
  { href: 'https://medium.com/@zahidhasantonmoy', label: 'Medium profile', Icon: FaMedium },
  { href: 'https://dev.to/zahidhasantonmoy', label: 'Dev.to profile', Icon: FaDev },
  { href: 'https://buymeacoffee.com/zahidhasantonmoy', label: 'Buy Me a Coffee', Icon: FaCoffee },
];

const Footer = () => {
  return (
    <>
      {/* Newsletter Section */}
      <NewsletterSection />

      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-[76px] border-t pt-10 pb-12"
        style={{
          background: 'var(--bg)',
          borderColor: 'var(--line-soft)',
          color: 'var(--ink)',
        }}
      >
        <div className="wrap">
          <div className="foot-name">Zahid Hasan Tonmoy</div>

          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:text-[var(--cyan)]"
                style={{ color: 'var(--ink-mute)' }}
              >
                <Icon size={24} aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className="foot-row">
            <span>© 2026 Zahid Hasan Tonmoy · Mirpur, Dhaka, Bangladesh</span>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Back to top ↑
            </a>
            <a href="https://zahidhasantonmoy.vercel.app/" target="_blank" rel="noopener">Main site ↗</a>
            <a href="https://github.com/zahidhasantonmoy" target="_blank" rel="noopener">GitHub ↗</a>
            <a href="/blog">Blog</a>
            <a href="/bn/blog">বাংলা ব্লগ</a>
            <a href="/links">Social Hub &amp; Links</a>
          </div>
        </div>
      </motion.footer>
    </>
  );
};

export default Footer;
