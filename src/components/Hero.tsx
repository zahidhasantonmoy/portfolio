"use client";
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFacebook, FaTwitter, FaBrain, FaDatabase, FaChartLine } from 'react-icons/fa';
import GradientText from './GradientText';

interface HeroProps {
  name: string;
  title: string;
}

const Hero = ({ name, title }: HeroProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    hover: {
      scale: 1.2,
      color: "#6EE7B7", // Tailwind teal-400
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Animated Grid/Pattern */}
        <motion.div
          className="absolute inset-0 bg-grid-pattern opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        ></motion.div>

        {/* Abstract Data Flow / Neural Network Lines */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M0,10 Q50,0 100,10 T0,20 Q50,30 100,40 T0,50 Q50,60 100,70 T0,80 Q50,90 100,100"
              stroke="url(#gradient1)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M100,0 Q50,10 0,20 T100,30 Q50,40 0,50 T100,60 Q50,70 0,80 T100,90 Q50,100 0,100"
              stroke="url(#gradient2)"
              strokeWidth="0.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" /> {/* Purple-500 */}
                <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EC4899" /> {/* Pink-500 */}
                <stop offset="100%" stopColor="#10B981" /> {/* Emerald-500 */}
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Iconic Overlays */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-white/5"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <FaBrain size={150} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 text-white/5"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <FaDatabase size={150} />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 180 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <FaChartLine size={150} />
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-white p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6 relative w-52 h-52 rounded-full overflow-hidden">
          <Image
            src="/images/profile.jpg"
            alt="Zahid Hasan Tonmoy"
            layout="fill"
            objectFit="cover"
            className="transform hover:scale-105 transition-transform duration-300 ease-in-out"
          />
          {/* Modern Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            animate={{
              boxShadow: ["0 0 15px rgba(59,130,246,0.8)", "0 0 25px rgba(139,92,246,0.8)", "0 0 15px rgba(59,130,246,0.8)"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
        </motion.div>
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold mb-2 drop-shadow-lg"
          variants={itemVariants}
        >
          <GradientText text={name} />
        </motion.h1>
        <motion.p
          className="text-2xl md:text-4xl font-light max-w-4xl leading-relaxed mb-8 text-gray-300"
          variants={itemVariants}
        >
          {title}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-8"
          variants={containerVariants}
        >
          <motion.a
            href="#projects"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Work
          </motion.a>
          <motion.a
            href="#contact"
            className="px-8 py-4 border-2 border-gray-400 text-gray-300 font-bold rounded-lg shadow-lg hover:bg-gray-700 hover:border-gray-700 transition-colors duration-300"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Me
          </motion.a>
        </motion.div>

        <motion.div
          className="flex space-x-6"
          variants={containerVariants}
        >
          <motion.a
            href="https://github.com/zahidhasantonmoy" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
            variants={iconVariants}
            whileHover="hover"
            whileTap={{ scale: 0.9 }}
          >
            <FaGithub size={30} />
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/zahidhasantonmoy/" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
            variants={iconVariants}
            whileHover="hover"
            whileTap={{ scale: 0.9 }}
          >
            <FaLinkedin size={30} />
          </motion.a>
          <motion.a
            href="https://www.facebook.com/zahidhasantonmoybd" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
            variants={iconVariants}
            whileHover="hover"
            whileTap={{ scale: 0.9 }}
          >
            <FaFacebook size={30} />
          </motion.a>
          <motion.a
            href="https://twitter.com/zahidhasantonmoy" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
            variants={iconVariants}
            whileHover="hover"
            whileTap={{ scale: 0.9 }}
          >
            <FaTwitter size={30} />
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;