'use client';

import { motion } from 'framer-motion';
import { FaCode, FaRobot, FaTools, FaGraduationCap } from 'react-icons/fa';

export default function About() {
  const skills = {
    webDevelopment: [
      { name: 'HTML5', icon: '🌐' },
      { name: 'CSS3', icon: '🎨' },
      { name: 'JavaScript', icon: '⚡' },
      { name: 'React.js', icon: '⚛️' },
      { name: 'Next.js', icon: '🚀' },
      { name: 'Node.js', icon: '🟢' },
      { name: 'MongoDB', icon: '🍃' },
      { name: 'TypeScript', icon: '📘' },
      { name: 'Tailwind CSS', icon: '🎯' },
      { name: 'RESTful APIs', icon: '🔌' }
    ],
    aiResearch: [
      { name: 'Data Preprocessing', icon: '📊' },
      { name: 'Model Training', icon: '🧠' },
      { name: 'Machine Learning', icon: '🤖' },
      { name: 'Deep Learning', icon: '📈' },
      { name: 'Computer Vision', icon: '👁️' },
      { name: 'Natural Language Processing', icon: '💬' }
    ],
    tools: [
      { name: 'Git', icon: '📦' },
      { name: 'VS Code', icon: '💻' },
      { name: 'Postman', icon: '🔍' },
      { name: 'Docker', icon: '🐳' },
      { name: 'AWS', icon: '☁️' },
      { name: 'Figma', icon: '🎨' }
    ]
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Skills & Expertise</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">My technical skills and knowledge</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Web Development Skills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-6">
              <FaCode className="text-3xl text-blue-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Web Development</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {skills.webDevelopment.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Research Skills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-6">
              <FaRobot className="text-3xl text-green-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Research</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {skills.aiResearch.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-300"
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tools & Technologies */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center mb-6">
              <FaTools className="text-3xl text-purple-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tools & Technologies</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {skills.tools.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-300"
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex items-center mb-6">
            <FaGraduationCap className="text-3xl text-yellow-500 mr-3" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Education & Background</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-300"
            >
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Bachelor of Science in CSE</h4>
              <p className="text-gray-600 dark:text-gray-300">Bangladesh University of Business and Technology</p>
              <p className="text-gray-500 dark:text-gray-400">Currently pursuing</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              viewport={{ once: true }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-300"
            >
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">HSC</h4>
              <p className="text-gray-600 dark:text-gray-300">Dhaka Uddan Government College</p>
              <p className="text-gray-500 dark:text-gray-400">2019</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              viewport={{ once: true }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors duration-300"
            >
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">SSC</h4>
              <p className="text-gray-600 dark:text-gray-300">Mohorkoya High School, Rajshahi</p>
              <p className="text-gray-500 dark:text-gray-400">2017</p>
            </motion.div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">Location: Dhaka, Bangladesh</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}