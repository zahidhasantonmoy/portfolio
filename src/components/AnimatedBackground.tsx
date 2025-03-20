import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedBackgroundProps {
  children: ReactNode;
  className?: string;
}

const AnimatedBackground = ({ children, className = "" }: AnimatedBackgroundProps) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground; 