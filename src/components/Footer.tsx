
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="bg-gray-800 text-white py-10"
    >
      <div className="container mx-auto px-6 text-center">
        <div className="flex justify-center space-x-6 mb-6">
          <a href="https://github.com/zahidhasantonmoy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
            <FaGithub size={30} />
          </a>
          <a href="https://www.linkedin.com/in/zahidhasantonmoy/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
            <FaLinkedin size={30} />
          </a>
          <a href="https://www.facebook.com/zahidhasantonmoybd" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
            <FaFacebook size={30} />
          </a>
          <a href="https://twitter.com/zahidhasantonmoy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300">
            <FaTwitter size={30} />
          </a>
        </div>
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Zahid Hasan Tonmoy. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
