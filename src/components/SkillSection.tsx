'use client';

import { motion } from 'framer-motion';
import GradientText from './GradientText';

interface SkillCategory {
  category: string;
  items: string[];
}

interface SkillSectionProps {
  skills: SkillCategory[];
}

const SkillSection = ({ skills }: SkillSectionProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-12">
          {skills.map((skillCategory, categoryIndex) => (
            <motion.div
              key={skillCategory.category}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: categoryIndex * 0.1 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center md:text-left">
                {skillCategory.category}
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {skillCategory.items.map((skill, itemIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: categoryIndex * 0.1 + itemIndex * 0.05 }}
                    viewport={{ once: true, amount: 0.5 }}
                    className="px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-md text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-300 cursor-pointer"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
  );
};

export default SkillSection;