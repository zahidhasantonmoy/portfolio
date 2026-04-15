"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaBriefcase, FaAward, FaLightbulb, FaCode, FaChartBar } from 'react-icons/fa';

const timelineEvents = [
  {
    date: 'Ongoing',
    title: 'BSc in Computer Science and Engineering',
    institution: 'Bangladesh University of Business and Technology',
    description: 'Pursuing my undergraduate degree with a focus on AI, Machine Learning, and Software Development. Actively involved in project creation.',
    icon: <FaGraduationCap />,
    type: 'education',
    color: 'blue',
  },
  {
    date: '2019',
    title: 'Higher Secondary Certificate (HSC) - GPA: 5.00',
    institution: 'Dhaka Udyan Government College',
    description: 'Completed my higher secondary education with a focus on science and mathematics, laying a strong foundation for engineering studies.',
    icon: <FaGraduationCap />,
    type: 'education',
    color: 'blue',
  },
  {
    date: '2017',
    title: 'Secondary School Certificate (SSC) - GPA: 4.78',
    institution: 'Moharkaya High School',
    description: 'Completed my secondary education, where I first discovered my passion for technology and problem-solving.',
    icon: <FaGraduationCap />,
    type: 'education',
    color: 'blue',
  },
  {
    date: '2024',
    title: '2nd Position in Project Showcase',
    institution: 'Brainstorming Week',
    description: 'Awarded 2nd position for an outstanding project showcase, demonstrating creative problem-solving and technical innovation.',
    icon: <FaAward />,
    type: 'achievement',
    color: 'purple',
  },
  {
    date: '2025',
    title: 'Digital Marketing - Top Performer',
    institution: 'BUBT-TAFE',
    description: 'Recognized as Top Performer in comprehensive Digital Marketing certification program.',
    icon: <FaLightbulb />,
    type: 'certificate',
    color: 'green',
  },
  {
    date: '2019',
    title: 'Best Talent of the Year',
    institution: 'Creative Talent Search',
    description: 'Honored with the Best Talent of the Year award recognizing well-rounded capabilities and creativity.',
    icon: <FaAward />,
    type: 'achievement',
    color: 'pink',
  },
];

const colorMap = {
  blue: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
  green: { bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500' },
  pink: { bg: 'bg-pink-600', text: 'text-pink-400', border: 'border-pink-500' },
};

const TimelineSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const iconCircleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 10 } },
    hover: { scale: 1.2, transition: { duration: 0.2 } },
  };

  return (
    <section id="timeline" className="py-20 pb-40 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-16 text-white"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Journey
        </motion.h2>

        <div className="relative flex flex-col items-center">
          {/* Central Connecting Line - More Abstract */}
          <motion.div
            className="absolute h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            viewport={{ once: true, amount: 0.5 }}
          ></motion.div>

          {timelineEvents.map((event, index) => {
            const colors = colorMap[event.color as keyof typeof colorMap];
            return (
              <motion.div
                key={index}
                className={`relative flex items-center w-full mb-16 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Event Card */}
                <motion.div
                  className={`w-full md:w-5/12 p-8 rounded-xl shadow-xl border ${colors.border} bg-gray-800 transition-colors duration-300`}
                  whileHover={{ translateY: -5 }}
                >
                  <p className={`text-sm ${colors.text} mb-2 font-semibold`}>{event.date}</p>
                  <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                  <h4 className="text-lg font-semibold text-gray-300 mb-3">{event.institution}</h4>
                  <p className="text-gray-400 leading-relaxed">{event.description}</p>
                </motion.div>

                {/* Icon Circle */}
                <motion.div
                  className={`absolute flex items-center justify-center w-20 h-20 rounded-full ${colors.bg} text-white text-3xl shadow-lg z-10`}
                  variants={iconCircleVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true, amount: 0.5 }}
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                >
                  {event.icon}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;