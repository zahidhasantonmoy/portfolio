'use client';

import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';

interface ProjectCardProps {
  title: string;
  description: string;
  images: string[];
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  onClick: () => void;
}

const ProjectCard = ({ title, description, images, technologies, liveUrl, githubUrl, onClick }: ProjectCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for the tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the motion
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Transform mouse x/y to rotation degrees
  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  // Dynamic scale on hover
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  const handleMouseEnter = () => {
    scale.set(1.02);
  }

  // Glare effect gradient position
  const diagonalMovement = useTransform<number, number>(
    [rotateX, rotateY],
    ([newRotateX, newRotateY]) => {
      const position: number = newRotateX + newRotateY;
      return position;
    }
  );

  const glareOpacity = useTransform(scale, [1, 1.02], [0, 0.4]);
  const glareX = useTransform(xSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(ySpring, [-0.5, 0.5], ['0%', '100%']);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
      className="relative bg-white dark:bg-gray-800 rounded-xl rounded-tr-[30px] overflow-hidden shadow-xl cursor-pointer group perspective-1000 transform-gpu"
      onClick={onClick}
    >
      {/* Glare brightness layer */}
      <motion.div
        style={{
          opacity: glareOpacity,
          background: `radial-gradient(circle at ${50}% ${50}%, rgba(255,255,255,0.8), transparent 60%)`, // Simpler radial glare
          left: glareX,
          top: glareY,
          translateX: '-50%',
          translateY: '-50%',
          position: 'absolute',
          width: '200%',
          height: '200%',
          zIndex: 20,
          pointerEvents: 'none',
          mixBlendMode: 'overlay'
        }}
      />

      <div className="relative h-48 w-full overflow-hidden translate-z-20">
        <Image
          src={images[0]}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 translate-z-30">
          <h3 className="text-xl font-bold text-white shadow-sm">{title}</h3>
        </div>
      </div>

      <div className="p-6 relative z-10 bg-white dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md text-xs font-mono border border-blue-100 dark:border-blue-800"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-md">+{technologies.length - 3}</span>
          )}
        </div>

        <div className="flex justify-between mt-auto">
          {liveUrl && (
            <motion.a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              Live Demo
            </motion.a>
          )}
          {githubUrl && (
            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
            >
              Code
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
