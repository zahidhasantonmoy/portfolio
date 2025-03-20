import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
}

const AnimatedSection = ({ children, delay = 0 }: AnimatedSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection; 