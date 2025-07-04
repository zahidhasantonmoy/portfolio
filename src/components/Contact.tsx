
"use client";
import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.current) {
        setIsSubmitting(true);
        emailjs.sendForm(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
            form.current,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
        )
        .then((result) => {
            console.log(result.text);
            setIsSuccess(true);
            setIsSubmitting(false);
        }, (error) => {
            console.log(error.text);
            setIsSubmitting(false);
        });
    }
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Get In Touch
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            className="bg-gray-800 rounded-lg p-8 shadow-lg"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
            <div className="space-y-4 text-gray-300">
              <p className="flex items-center"><FaEnvelope className="mr-3 text-teal-400" /> zahidhasantonmoy360@gmail.com</p>
              <a href="tel:+8801724348000" className="flex items-center hover:underline"><FaPhone className="mr-3 text-teal-400" /> +880 1724 348000</a>
              <p className="flex items-center"><FaMapMarkerAlt className="mr-3 text-teal-400" /> Dhaka, Bangladesh</p>
            </div>
          </motion.div>
          <motion.div
            className="bg-gray-800 rounded-lg p-8 shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Send a Message</h3>
            {isSuccess ? (
              <p className="text-center text-2xl text-teal-400">Thank you for your message! I will get back to you shortly.</p>
            ) : (
              <form ref={form} onSubmit={sendEmail}>
                <div className="mb-4">
                  <label htmlFor="user_name" className="block text-white mb-2">Name</label>
                  <input type="text" id="user_name" name="user_name" required className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                <div className="mb-4">
                  <label htmlFor="user_email" className="block text-white mb-2">Email</label>
                  <input type="email" id="user_email" name="user_email" required className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400" />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-white mb-2">Message</label>
                  <textarea id="message" name="message" required rows={4} className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition-colors duration-300 disabled:bg-gray-600">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
