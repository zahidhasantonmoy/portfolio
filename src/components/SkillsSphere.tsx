'use client';

import { useEffect, useRef } from 'react';
import TagCloud from 'TagCloud';
import { motion } from 'framer-motion';

interface SkillCategory {
  category: string;
  items: string[];
}

interface SkillsSphereProps {
  skills: SkillCategory[];
}

const SkillsSphere = ({ skills }: SkillsSphereProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear any existing content to prevent duplicates
      containerRef.current.innerHTML = '';

      const allSkills = skills.flatMap(category => category.items);
      // Fallback if data is missing, though verified it exists
      const texts = allSkills.length > 0 ? allSkills : ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Node.js'];

      const options = {
        radius: 300,
        maxSpeed: 'normal',
        initSpeed: 'normal',
        direction: 135,
        keep: true,
        useContainerInlineStyles: false,
      };

      try {
        // @ts-ignore
        const tagCloud = TagCloud(containerRef.current, texts, options);

        return () => {
          if (tagCloud) {
            tagCloud.destroy();
          }
        };
      } catch (error) {
        console.error("TagCloud init failed:", error);
      }
    }
  }, [skills]);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Debug: Hidden list to verify data presence in DOM */}
      <div className="hidden">
        {skills.flatMap(c => c.items).join(', ')}
      </div>

      <div
        ref={containerRef}
        className="text-lg font-bold text-gray-800 dark:text-blue-400 cursor-pointer select-none relative z-10"
      />
    </div>
  );
};

export default SkillsSphere;
