"use client";

import { useEffect, useRef } from 'react';
import TagCloud from 'TagCloud';
import { motion } from 'framer-motion';

const SkillsSphere = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = '.tagcloud';
    const texts = [
      'HTML5', 'CSS3', 'JavaScript',
      'React', 'Next.js', 'TypeScript',
      'Node.js', 'Express', 'MongoDB',
      'Git', 'REST API', 'GraphQL',
      'Tailwind', 'Firebase', 'AWS',
      'Docker', 'Redux', 'PostgreSQL',
      'Python', 'Java', 'Spring Boot',
      'CI/CD', 'Jest', 'WebSockets'
    ];

    const options = {
      radius: 300,
      maxSpeed: 'fast',
      initSpeed: 'fast',
      direction: 135,
      keep: true,
      useContainerInlineStyles: false,
    };

    // @ts-ignore
    let tagCloud = TagCloud(container, texts, options);

    return () => {
      tagCloud.destroy();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-[600px] flex items-center justify-center bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900"
    >
      <div
        ref={containerRef}
        className="tagcloud text-blue-600 dark:text-blue-400 cursor-pointer select-none"
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      />
    </motion.div>
  );
};

export default SkillsSphere; 