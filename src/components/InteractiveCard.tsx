import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  title: string;
  description: string;
  icon?: ReactNode;
}

const InteractiveCard = ({ children, title, description, icon }: InteractiveCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          {icon && <div className="text-2xl">{icon}</div>}
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <div className="mt-4">{children}</div>
      </div>
    </motion.div>
  );
};

export default InteractiveCard; 