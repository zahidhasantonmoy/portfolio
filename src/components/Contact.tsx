"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheck, FaGithub, FaLinkedin, FaMedium, FaDev, FaCoffee } from 'react-icons/fa';
import toast from 'react-hot-toast';

import { useAudio } from '@/hooks/useAudio';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPlane, setShowPlane] = useState(false);

  const { playSwoosh, playSuccess } = useAudio();

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    
    setIsSubmitting(true);
    setShowPlane(true);
    playSwoosh();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("user_name"),
          email: formData.get("user_email"),
          message: formData.get("message"),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        playSuccess();
        setShowPlane(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again later.");
      setIsSubmitting(false);
      setShowPlane(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 transition-colors duration-300 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-16 gradient-text"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Get In Touch
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            className="glass-card rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl h-fit"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8" style={{ color: 'var(--text-primary)' }}>Contact Information</h3>
            <div className="space-y-6" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center p-4 rounded-xl hover:shadow-md transition-shadow" style={{ background: 'var(--bg-base)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                  <FaEnvelope size={20} />
                </div>
                <span>zahidhasantonmoy.dev@gmail.com</span>
              </div>

              <a href="tel:+8801850077786" className="flex items-center p-4 rounded-xl hover:shadow-md transition-shadow" style={{ background: 'var(--bg-base)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                  <FaPhone size={20} />
                </div>
                <span>+880 1850 077786</span>
              </a>

              <div className="flex items-center p-4 rounded-xl hover:shadow-md transition-shadow" style={{ background: 'var(--bg-base)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-secondary)' }}>
                  <FaMapMarkerAlt size={20} />
                </div>
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social & Developer Profiles */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>
                Connect &amp; Follow
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { href: "https://github.com/zahidhasantonmoy", label: "GitHub", icon: FaGithub },
                  { href: "https://www.linkedin.com/in/zahidhasantonmoy/", label: "LinkedIn", icon: FaLinkedin },
                  { href: "https://medium.com/@zahidhasantonmoy", label: "Medium", icon: FaMedium },
                  { href: "https://dev.to/zahidhasantonmoy", label: "Dev.to", icon: FaDev },
                ].map(({ href, label, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} profile`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:shadow-md"
                    style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                  </a>
                ))}
                <a
                  href="https://buymeacoffee.com/zahidhasantonmoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Buy Me a Coffee"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:shadow-md hover:scale-105 transition-all text-xs font-semibold"
                  style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#EAB308', border: '1px solid rgba(234, 179, 8, 0.2)' }}
                >
                  <FaCoffee size={15} />
                  <span>Buy Me a Coffee</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Form Area */}
          <div className="relative">
            <AnimatePresence mode='wait'>
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  exit={{ scale: 0, opacity: 0, rotateX: -90 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl"
                >
                  {showPlane ? (
                    <motion.div
                      key="plane"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 1, 0],
                        x: [0, 0, 200, 500],
                        y: [0, 0, -100, -300],
                        rotate: [0, 0, 10, 45],
                        opacity: [0, 1, 1, 0]
                      }}
                      transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
                      className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                      <FaPaperPlane style={{ color: 'var(--accent-primary)' }} className="w-32 h-32" />
                    </motion.div>
                  ) : null}

                  <motion.div
                    animate={showPlane ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Send a Message</h3>
                    <form onSubmit={sendEmail} className="space-y-6">
                      <div>
                        <label htmlFor="user_name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Name</label>
                        <input type="text" id="user_name" name="user_name" required className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' } as any} placeholder="John Doe" />
                      </div>
                      <div>
                        <label htmlFor="user_email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                        <input type="email" id="user_email" name="user_email" required className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' } as any} placeholder="john@example.com" />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Message</label>
                        <textarea id="message" name="message" required rows={4} className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-primary)' } as any} placeholder="Your message..."></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full font-bold py-4 px-6 rounded-lg hover:shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
                        style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                      >
                        {isSubmitting ? (
                          <span>Sending...</span>
                        ) : (
                          <>
                            Send Message <FaPaperPlane className="text-sm" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                  style={{ border: '1px solid rgba(34, 197, 94, 0.3)' }}
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                    <FaCheck style={{ color: 'var(--success)' }} className="text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Thanks for reaching out. I'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="btn-ghost mt-8 px-6 py-2 rounded-lg"
                  >
                    Send another
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
