"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFacebook, FaTwitter, FaMedium, FaDev, FaCoffee } from 'react-icons/fa';
import NewsletterSection from './NewsletterSection';

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
        className="border-t py-10 sm:py-12"
        style={{
          background: 'var(--bg-base)',
          borderColor: 'var(--border)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
            <a
              href="https://github.com/zahidhasantonmoy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <FaGithub size={24} aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/zahidhasantonmoy/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <FaLinkedin size={24} aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com/zahidhasantonmoybd"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook profile"
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <FaFacebook size={24} aria-hidden="true" />
            </a>
            <a
              href="https://x.com/zahidhasan_bd"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X profile"
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <FaTwitter size={24} aria-hidden="true" />
            </a>
            <a
              href="https://medium.com/@zahidhasantonmoy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Medium profile"
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <FaMedium size={24} aria-hidden="true" />
            </a>
            <a
              href="https://dev.to/zahidhasantonmoy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dev.to profile"
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <FaDev size={24} aria-hidden="true" />
            </a>
            <a
              href="https://buymeacoffee.com/zahidhasantonmoy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buy Me a Coffee"
              className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 text-yellow-500 hover:text-yellow-400"
            >
              <FaCoffee size={24} aria-hidden="true" />
            </a>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            <a href="/links" className="hover:text-blue-500 font-medium transition-colors">Social Hub & Links</a>
            <span>•</span>
            <a href="/blog" className="hover:text-blue-500 transition-colors">Tech Blog</a>
            <span>•</span>
            <a href="/bn/blog" className="hover:text-blue-500 transition-colors">বাংলা ব্লগ</a>
            <span>•</span>
            <a href="/journal" className="hover:text-blue-500 transition-colors">Dev Journal</a>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            &copy; {new Date().getFullYear()} Zahid Hasan Tonmoy. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </>
  );
};

export default Footer;
