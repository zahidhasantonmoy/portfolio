import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
}

const GradientText = ({ 
  children, 
  className = "", 
  gradient = "from-blue-500 via-purple-500 to-pink-500" 
}: GradientTextProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-clip-text text-transparent bg-gradient-to-r ${gradient} ${className}`}
    >
      {children}
    </motion.span>
  );
};

export default GradientText; 