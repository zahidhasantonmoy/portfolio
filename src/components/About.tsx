
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const aboutImages = [
  '/images/1719598581208.jpg',
  '/images/1719599333853.jpg',
  '/images/1719599663754.jpg',
  '/images/1719629502931.jpg',
  '/images/20230104_142107.jpg',
  '/images/20230104_142212.jpg',
  '/images/20230104_143643.jpg',
];

interface AboutProps {
  aboutMe: string;
}

const About = ({ aboutMe }: AboutProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % aboutImages.length
      );
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="about" className="py-32 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          About Me
        </motion.h2>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="md:w-1/3 relative w-64 h-64 sm:w-80 sm:h-80 overflow-hidden rounded-lg shadow-2xl mx-auto"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src={aboutImages[currentImageIndex]}
              alt="About Me Image"
              width={320} // Adjusted width
              height={320} // Adjusted height
              className="rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            className="md:w-2/3 text-lg text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="mb-4">
              {aboutMe}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
