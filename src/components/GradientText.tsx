import React from 'react';

interface GradientTextProps {
  text: string;
  className?: string;
}

const GradientText: React.FC<GradientTextProps> = ({ text, className }) => {
  return (
    <span className={`bg-gradient-to-r from-teal-400 to-blue-500 text-transparent bg-clip-text ${className}`}>
      {text}
    </span>
  );
};

export default GradientText;