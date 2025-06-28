"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GradientText from './GradientText';

interface TimelineEvent {
  id: number;
  year: string;
  title: string;
  description: string;
  category: 'education' | 'experience' | 'achievement';
  icon: string;
}

const timelineData: TimelineEvent[] = [
  {
    id: 1,
    year: '2023',
    title: 'Full Stack Developer',
    description: 'Working on modern web applications using React, Node.js, and cloud technologies.',
    category: 'experience',
    icon: '💼'
  },
  {
    id: 2,
    year: '2022',
    title: 'Bachelor\'s Degree in Computer Science',
    description: 'Graduated with honors, specializing in software engineering and web development.',
    category: 'education',
    icon: '🎓'
  },
  {
    id: 3,
    year: '2021',
    title: 'Tech Innovation Award',
    description: 'Received recognition for developing an innovative mobile application.',
    category: 'achievement',
    icon: '🏆'
  },
  // Add more events as needed
];

const InteractiveTimeline = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

  const filteredEvents = selectedCategory === 'all'
    ? timelineData
    : timelineData.filter(event => event.category === selectedCategory);

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText text="My Journey" className="text-4xl font-bold mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Explore my professional timeline and achievements
          </p>
        </motion.div>

        <div className="flex justify-center space-x-4 mb-12">
          {['all', 'education', 'experience', 'achievement'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 dark:bg-gray-700" />
          
          <div className="space-y-12">
            <AnimatePresence>
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  transition={{ duration: 0.5 }}
                  className={`flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  onMouseEnter={() => setHoveredEvent(event.id)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="text-4xl mb-4">{event.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {event.description}
                      </p>
                      <span className="inline-block mt-4 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {event.year}
                      </span>
                    </motion.div>
                  </div>

                  <div className="relative flex items-center justify-center w-8">
                    <motion.div
                      animate={{
                        scale: hoveredEvent === event.id ? 1.5 : 1,
                        backgroundColor: hoveredEvent === event.id ? '#3B82F6' : '#E5E7EB'
                      }}
                      className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 z-10"
                    />
                  </div>

                  <div className="w-1/2" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveTimeline; 