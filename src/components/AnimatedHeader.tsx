import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedHeaderProps {
  children: ReactNode;
  className?: string;
}

const AnimatedHeader = ({ children, className = "" }: AnimatedHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`text-4xl font-bold mb-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedHeader; 