"use client";

import { motion } from 'framer-motion';
import GradientText from './GradientText';
import { useState } from 'react';

interface SkillNode {
  id: string;
  name: string;
  level: number;
  children?: SkillNode[];
  icon?: string;
}

const skillTree: SkillNode = {
  id: "root",
  name: "Web Development",
  level: 90,
  children: [
    {
      id: "frontend",
      name: "Frontend",
      level: 95,
      children: [
        {
          id: "react",
          name: "React",
          level: 95,
          icon: "⚛️"
        },
        {
          id: "typescript",
          name: "TypeScript",
          level: 90,
          icon: "TS"
        },
        {
          id: "nextjs",
          name: "Next.js",
          level: 85,
          icon: "▲"
        }
      ]
    },
    {
      id: "backend",
      name: "Backend",
      level: 85,
      children: [
        {
          id: "nodejs",
          name: "Node.js",
          level: 85,
          icon: "🟢"
        },
        {
          id: "express",
          name: "Express",
          level: 80,
          icon: "🚂"
        },
        {
          id: "mongodb",
          name: "MongoDB",
          level: 75,
          icon: "🍃"
        }
      ]
    },
    {
      id: "tools",
      name: "Tools & Others",
      level: 88,
      children: [
        {
          id: "git",
          name: "Git",
          level: 90,
          icon: "🔄"
        },
        {
          id: "docker",
          name: "Docker",
          level: 75,
          icon: "🐳"
        },
        {
          id: "aws",
          name: "AWS",
          level: 70,
          icon: "☁️"
        }
      ]
    }
  ]
};

const SkillNode: React.FC<{
  node: SkillNode;
  depth: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ node, depth, isExpanded, onToggle }) => {
  const hasChildren = node.children && node.children.length > 0;
  const [childStates, setChildStates] = useState<{ [key: string]: boolean }>(
    node.children?.reduce((acc, child) => ({ ...acc, [child.id]: false }), {}) || {}
  );

  const toggleChild = (childId: string) => {
    setChildStates(prev => ({ ...prev, [childId]: !prev[childId] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="ml-4"
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow mb-4 cursor-pointer"
        onClick={onToggle}
      >
        {node.icon && (
          <span className="text-2xl">{node.icon}</span>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {node.name}
            </h4>
            {hasChildren && (
              <span className="text-gray-500 dark:text-gray-400">
                {isExpanded ? "▼" : "▶"}
              </span>
            )}
          </div>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${node.level}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600"
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {node.level}%
          </span>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {node.children?.map((child) => (
            <SkillNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isExpanded={childStates[child.id]}
              onToggle={() => toggleChild(child.id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const SkillTreeSection = () => {
  const [isRootExpanded, setIsRootExpanded] = useState(true);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText text="My Skill Tree" className="text-4xl font-bold mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            An interactive visualization of my technical skills
          </p>
        </motion.div>

        <SkillNode
          node={skillTree}
          depth={0}
          isExpanded={isRootExpanded}
          onToggle={() => setIsRootExpanded(!isRootExpanded)}
        />
      </div>
    </section>
  );
};

export default SkillTreeSection; 