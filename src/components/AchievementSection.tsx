import { motion } from 'framer-motion';
import GradientText from './GradientText';

interface Achievement {
  title: string;
  description: string;
  date: string;
  icon: string;
}

const achievements: Achievement[] = [
  {
    title: 'Best Web Developer Award',
    description: 'Recognized for outstanding contributions in web development',
    date: '2024',
    icon: '🏆'
  },
  {
    title: 'Project of the Year',
    description: 'Awarded for developing an innovative web application',
    date: '2023',
    icon: '🌟'
  },
  {
    title: 'Technical Excellence',
    description: 'Acknowledged for technical expertise and problem-solving skills',
    date: '2023',
    icon: '💡'
  },
  {
    title: 'Team Leadership',
    description: 'Led a team of developers to successfully complete multiple projects',
    date: '2022',
    icon: '👥'
  }
];

const AchievementSection = () => {
  return (
    <section id="achievements" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText text="My Achievements" className="text-4xl font-bold mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Milestones in my journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{achievement.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {achievement.description}
                  </p>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {achievement.date}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementSection; 