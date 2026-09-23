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
    color: 'primary',
  },
  {
    date: '2019',
    title: 'Higher Secondary Certificate (HSC) - GPA: 5.00',
    institution: 'Dhaka Udyan Government College',
    description: 'Completed my higher secondary education with a focus on science and mathematics, laying a strong foundation for engineering studies.',
    icon: <FaGraduationCap />,
    type: 'education',
    color: 'primary',
  },
  {
    date: '2017',
    title: 'Secondary School Certificate (SSC) - GPA: 4.78',
    institution: 'Moharkaya High School',
    description: 'Completed my secondary education, where I first discovered my passion for technology and problem-solving.',
    icon: <FaGraduationCap />,
    type: 'education',
    color: 'primary',
  },
  {
    date: '2024',
    title: '2nd Position in Project Showcase',
    institution: 'Brainstorming Week',
    description: 'Awarded 2nd position for an outstanding project showcase, demonstrating creative problem-solving and technical innovation.',
    icon: <FaAward />,
    type: 'achievement',
    color: 'secondary',
  },
  {
    date: '2025',
    title: 'Digital Marketing - Top Performer',
    institution: 'BUBT-TAFE',
    description: 'Recognized as Top Performer in comprehensive Digital Marketing certification program.',
    icon: <FaLightbulb />,
    type: 'certificate',
    color: 'success',
  },
  {
    date: '2019',
    title: 'Best Talent of the Year',
    institution: 'Creative Talent Search',
    description: 'Honored with the Best Talent of the Year award recognizing well-rounded capabilities and creativity.',
    icon: <FaAward />,
    type: 'achievement',
    color: 'secondary',
  },
];

const colorMap = {
  primary: { bg: 'var(--accent-primary)', text: 'var(--accent-primary)', border: 'var(--accent-primary)' },
  secondary: { bg: 'var(--accent-secondary)', text: 'var(--accent-secondary)', border: 'var(--accent-secondary)' },
  success: { bg: 'var(--success)', text: 'var(--success)', border: 'var(--success)' },
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
    <section id="timeline" className="py-20 pb-40" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-16 gradient-text"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Journey
        </motion.h2>

        <div className="relative flex flex-col items-center">
          {/* Central Connecting Line */}
          <motion.div
            className="absolute h-full w-1 rounded-full"
            style={{ background: 'linear-gradient(to bottom, var(--accent-primary), var(--accent-secondary), var(--accent-primary))' }}
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
                  className="w-full md:w-5/12 p-8 rounded-xl shadow-xl transition-colors duration-300"
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1px solid var(--border)`,
                  }}
                  whileHover={{ translateY: -5, borderColor: colors.border }}
                >
                  <p className="text-sm mb-2 font-semibold" style={{ color: colors.text }}>{event.date}</p>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{event.title}</h3>
                  <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{event.institution}</h4>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
                </motion.div>

                {/* Icon Circle */}
                <motion.div
                  className="absolute flex items-center justify-center w-20 h-20 rounded-full text-white text-3xl shadow-lg z-10"
                  style={{ background: colors.bg }}
                  variants={iconCircleVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  viewport={{ once: true, amount: 0.5 }}
                  // Keep the positioning exactly as before
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