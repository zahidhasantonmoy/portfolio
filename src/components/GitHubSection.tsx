
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';

const GitHubSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.6)", // Tailwind blue-500 shadow
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <section id="github" className="py-20 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 relative overflow-hidden">
      {/* Background Grid/Pattern */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'url(/images/grid-pattern-light.svg)', backgroundSize: 'cover' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-gray-800"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My GitHub Profile
        </motion.h2>
        <motion.div
          className="flex flex-col items-center justify-center gap-8 bg-white/80 backdrop-blur-sm rounded-xl p-10 shadow-2xl border border-gray-300"
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="text-lg text-center max-w-2xl text-gray-700 leading-relaxed">
            Explore my open-source contributions, personal projects, and coding activity. My GitHub profile is a testament to my continuous learning and practical application of skills in AI, Data Analysis, and Digital Marketing.
          </p>
          <motion.a
            href="https://github.com/zahidhasantonmoy" target="_blank" rel="noopener noreferrer"
            className="flex items-center px-10 py-5 bg-blue-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaGithub className="mr-4" size={32} />
            Visit My GitHub
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubSection;
