
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

const About = () => {
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
              I am a dedicated Data Analyst, AI Agent Developer, and Digital Marketer with a passion for leveraging data-driven insights and artificial intelligence to drive impactful digital strategies. My expertise lies in transforming complex data into actionable intelligence, developing intelligent AI agents, and executing effective digital marketing campaigns.
            </p>
            <p className="mb-4">
              I possess a strong command of Python for data analysis and AI development (including machine learning and deep learning with frameworks like TensorFlow and PyTorch), and I am adept at building robust AI agents. My skills also extend to web development with Android Studio and Flutter for mobile solutions, as well as WordPress for web content management.
            </p>
            <p>
              I am passionate about continuous innovation and applying a synergistic blend of analytical rigor, AI automation, and digital strategy to solve challenges and create impactful outcomes in the digital realm. Let's explore how my unique skill set can contribute to your next project.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
