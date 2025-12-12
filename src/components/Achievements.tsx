
"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface Achievement {
  title: string;
  category: string;
  location: string;
  certificateStatus: string;
  date?: string;
}

const achievements: Achievement[] = [
  {
    title: 'Creative Talent Search',
    category: 'Creative Arts',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Folk Song',
    category: 'Cultural Performance',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Hamd, Nat',
    category: 'Religious Performance',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Project Showcase',
    category: 'Technology Exhibition',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Software Development Competition',
    category: 'Software Development Competition',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Intro to Machine Learning',
    category: 'Data Science & AI',
    location: 'Online',
    certificateStatus: 'Included',
  },
  {
    title: 'Cyber Hygiene',
    category: 'Cybersecurity',
    location: 'Online',
    certificateStatus: 'Included',
  },
  {
    title: 'Certificate of Achievement',
    category: 'Recognition',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Professional Certificate',
    category: 'Professional Development',
    location: 'Online',
    certificateStatus: 'Included',
  },
];

const Achievements = () => {
  return (
    <section id="achievements" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Credentials
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-700 transition-colors duration-300 border border-gray-700"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold text-blue-400 mb-4">{achievement.title}</h3>
              <div className="space-y-2">
                {achievement.category && (
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-gray-500">Category:</span> {achievement.category}
                  </p>
                )}
                {achievement.location && (
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-gray-500">Location:</span> {achievement.location}
                  </p>
                )}
                {achievement.date && (
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-gray-500">Date:</span> {achievement.date}
                  </p>
                )}
                {achievement.certificateStatus && (
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-gray-500">Status:</span> {achievement.certificateStatus}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
