"use client";
import React from 'react';
import { motion } from 'framer-motion';

const NewsletterSection = () => {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass-card rounded-3xl p-8 sm:p-12 border border-border"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 gradient-text">
            Stay Updated
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            Subscribe to get insights on full-stack architecture, AI agent engineering, and web development.
          </p>
          
          <form className="max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus-ring"
                style={{
                  background: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)'
                }}
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3 text-sm font-semibold rounded-xl"
              >
                Subscribe
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;