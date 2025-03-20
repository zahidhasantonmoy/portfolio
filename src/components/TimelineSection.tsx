"use client";

import { motion } from 'framer-motion';
import GradientText from './GradientText';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    date: "2024",
    title: "Senior Frontend Developer",
    description: "Leading frontend development team and implementing modern web technologies.",
    category: "Work",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    date: "2023",
    title: "Full Stack Development Certification",
    description: "Completed advanced certification in full stack web development.",
    category: "Education",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3m0 0l3-3m-3 3V8" />
      </svg>
    )
  },
  {
    date: "2022",
    title: "Frontend Developer",
    description: "Developed responsive web applications using modern frameworks.",
    category: "Work",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  }
];

const TimelineSection = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText className="text-4xl font-bold mb-4">
            My Journey
          </GradientText>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Key milestones in my career path
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-12">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.date}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`relative flex items-center justify-between ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className="w-5/12">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm mb-4">
                      {event.category}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full">
                  <div className="text-white">
                    {event.icon}
                  </div>
                </div>

                {/* Date */}
                <div className="w-5/12 flex items-center">
                  <div className={`text-xl font-bold text-gray-500 dark:text-gray-400 ${
                    index % 2 === 0 ? 'text-right' : 'text-left'
                  }`}>
                    {event.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection; 