import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = "", 
  type = "button" 
}: AnimatedButtonProps) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg 
                 hover:bg-blue-700 transition-colors duration-200 ${className}`}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton; 