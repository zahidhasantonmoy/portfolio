"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Achievement {
  title: string;
  category: string;
  location: string;
  certificateStatus: string;
  date?: string;
  position?: string;
}

const achievements: Achievement[] = [
  {
    title: 'Digital Marketing (TAFE)',
    category: 'Professional Training',
    location: 'BUBT - TAFE',
    certificateStatus: 'Verified',
    date: 'Oct 20, 2025',
    position: 'Top Performer',
  },
  {
    title: 'Cyber Hygiene Training',
    category: 'Cybersecurity',
    location: 'Google.org & Asia Foundation',
    certificateStatus: 'Verified',
    date: 'Aug 08, 2025',
    position: 'Certified',
  },
  {
    title: 'Intro to Machine Learning',
    category: 'Data Science',
    location: 'Kaggle',
    certificateStatus: 'Verified',
    date: 'Nov 4, 2025',
    position: 'Completed',
  },
  {
    title: 'Python Course',
    category: 'Programming',
    location: 'GeeksforGeeks',
    certificateStatus: 'Verified',
    date: '2025',
    position: 'Certified',
  },
  {
    title: 'Project Showcase (SE Mode)',
    category: 'University Competition',
    location: 'BUBT (CSE Dept)',
    certificateStatus: 'Verified',
    date: 'Nov 28, 2024',
    position: '2nd Place',
  },
  {
    title: 'Software Development Competition',
    category: 'University Competition',
    location: 'BUBT (SkillXchange)',
    certificateStatus: 'Verified',
    date: 'Nov 27, 2024',
    position: 'Participant',
  },
  {
    title: 'Creative Talent Search',
    category: 'Science',
    location: 'Govt. of Bangladesh',
    certificateStatus: 'Verified',
    date: 'Mar 18, 2019',
    position: 'Year\'s Best Talent',
  },
  {
    title: 'Folk Song Competition',
    category: 'Cultural',
    location: 'Dhaka Udyan Govt. College',
    certificateStatus: 'Verified',
    date: '2019',
    position: '3rd Place',
  },
  {
    title: 'Hamd/Nat Competition',
    category: 'Cultural',
    location: 'Dhaka Udyan Govt. College',
    certificateStatus: 'Verified',
    date: '2019',
    position: '3rd Place',
  },
];

const Achievements = () => {
  const [toasts, setToasts] = useState<string[]>([]);

  // Simulate unlocks when viewing
  const handleViewportEnter = () => {
    // Trigger a fun sequence
    if (toasts.length === 0) {
      setTimeout(() => setToasts(prev => [...prev, "Visitor"]), 500);
      setTimeout(() => setToasts(prev => [...prev, "Explorer"]), 2500);
    }
  };

  return (
    <section id="achievements" className="py-20 bg-gray-900 text-white relative">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          onViewportEnter={handleViewportEnter}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            My Credentials
          </span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className="relative group bg-gray-800 rounded-xl overflow-hidden p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl">
                🏆
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 text-blue-400">
                  <span className="text-xl">🎖️</span>
                  {achievement.position && (
                    <span className="text-sm font-semibold tracking-wider uppercase bg-blue-500/10 px-3 py-1 rounded-full">
                      {achievement.position}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-blue-400 transition-colors">
                  {achievement.title}
                </h3>

                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center">🏷️</span>
                    <span className="text-sm">{achievement.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center">📍</span>
                    <span className="text-sm">{achievement.location}</span>
                  </div>

                  {achievement.date && (
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center">📅</span>
                      <span className="text-sm">{achievement.date}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievement Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gray-800 border border-yellow-500/50 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h4 className="font-bold text-yellow-500 text-sm uppercase tracking-wider">Achievement Unlocked</h4>
                <p className="font-bold">{toast}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Achievements;
