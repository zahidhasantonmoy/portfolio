import { motion } from 'framer-motion';
import GradientText from './GradientText';

interface Skill {
  name: string;
  level: number;
  icon: string;
}

const skills: Skill[] = [
  { name: 'React', level: 90, icon: '⚛️' },
  { name: 'Next.js', level: 85, icon: '🚀' },
  { name: 'TypeScript', level: 80, icon: '📘' },
  { name: 'Tailwind CSS', level: 95, icon: '🎨' },
  { name: 'Node.js', level: 75, icon: '🟢' },
  { name: 'MongoDB', level: 70, icon: '🍃' },
];

const SkillSection = () => {
  return (
    <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText text="My Skills" className="text-4xl font-bold mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Technologies I work with
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{skill.icon}</span>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {skill.name}
                </h3>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                />
              </div>
              <div className="mt-2 text-right">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {skill.level}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillSection; 