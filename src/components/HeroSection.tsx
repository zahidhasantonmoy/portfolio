import { motion } from 'framer-motion';
import GradientText from './GradientText';
import AnimatedButton from './AnimatedButton';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"
      />
      
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <GradientText className="text-5xl md:text-7xl font-bold mb-4">
            Welcome to My Portfolio
          </GradientText>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            I create beautiful and functional web experiences
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <AnimatedButton onClick={() => window.location.href = '#projects'}>
            View Projects
          </AnimatedButton>
          <AnimatedButton 
            onClick={() => window.location.href = '#contact'}
            className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            Contact Me
          </AnimatedButton>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12"
        >
          <div className="flex justify-center space-x-6">
            {['React', 'Next.js', 'TypeScript', 'Tailwind CSS'].map((tech) => (
              <motion.div
                key={tech}
                whileHover={{ scale: 1.1 }}
                className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tech}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection; 