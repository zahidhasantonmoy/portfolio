"use client";
import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaCheck } from 'react-icons/fa';

import { useAudio } from '@/hooks/useAudio';

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPlane, setShowPlane] = useState(false);

  const { playSwoosh, playSuccess } = useAudio();

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.current) {
      setIsSubmitting(true);
      // Start animation
      setShowPlane(true);
      playSwoosh();

      emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
      )
        .then((result) => {
          console.log(result.text);
          setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            playSuccess();
            setShowPlane(false);
          }, 2000); // Wait for animation roughly
        }, (error) => {
          console.log(error.text);
          setIsSubmitting(false);
          setShowPlane(false);
        });
    }
  };

  return (
    <section id="contact" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.h2
          className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Get In Touch
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 shadow-xl h-fit"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Contact Information</h3>
            <div className="space-y-6 text-gray-600 dark:text-gray-300">
              <div className="flex items-center p-4 bg-white dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                  <FaEnvelope size={20} />
                </div>
                <span>zahidhasantonmoy360@gmail.com</span>
              </div>

              <a href="tel:+8801724348000" className="flex items-center p-4 bg-white dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow hover:text-blue-600 dark:hover:text-blue-400">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mr-4">
                  <FaPhone size={20} />
                </div>
                <span>+880 1724 348000</span>
              </a>

              <div className="flex items-center p-4 bg-white dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4">
                  <FaMapMarkerAlt size={20} />
                </div>
                <span>Dhaka, Bangladesh</span>
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
                  exit={{ scale: 0, opacity: 0, rotateX: -90 }} // Fold effect start
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700"
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
                      <FaPaperPlane className="text-blue-500 w-32 h-32" />
                    </motion.div>
                  ) : null}

                  <motion.div
                    animate={showPlane ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h3>
                    <form ref={form} onSubmit={sendEmail} className="space-y-6">
                      <div>
                        <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                        <input type="text" id="user_name" name="user_name" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" placeholder="John Doe" />
                      </div>
                      <div>
                        <label htmlFor="user_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input type="email" id="user_email" name="user_email" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                        <textarea id="message" name="message" required rows={4} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white" placeholder="Your message..."></textarea>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-green-200 dark:border-green-900 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <FaCheck className="text-green-500 text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Thanks for reaching out. I'll get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="mt-8 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
