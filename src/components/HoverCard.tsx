import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoverCardProps {
  children: ReactNode;
}

const HoverCard = ({ children }: HoverCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

export default HoverCard; 