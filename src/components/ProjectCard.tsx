'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';

const CASE_STUDY_MAP: Record<string, string> = {
  jerseyvault: "jerseyvault",
};

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
  const normalizedKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const caseStudySlug = CASE_STUDY_MAP[normalizedKey];

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
      className="relative rounded-xl rounded-tr-[30px] overflow-hidden shadow-xl cursor-pointer group perspective-1000 transform-gpu hover:shadow-glow-sm transition-shadow duration-300"
      onClick={onClick}
    >
      {/* Card background via inline style for token support */}
      <div className="absolute inset-0" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />

      {/* Glare brightness layer */}
      <motion.div
        style={{
          opacity: glareOpacity,
          background: `radial-gradient(circle at ${50}% ${50}%, rgba(255,255,255,0.8), transparent 60%)`,
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 translate-z-30">
          <h3 className="text-xl font-bold text-white shadow-sm">{title}</h3>
        </div>
      </div>

      <div className="p-6 relative z-10" style={{ background: 'var(--bg-surface)' }}>
        <p className="mb-4 line-clamp-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>

        {/* Tech tags — uniform bg-accent-primary/10 text-accent-primary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 rounded-md text-xs font-mono"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              {tech}
            </span>
          ))}
          {technologies.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-md" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-secondary)' }}>+{technologies.length - 3}</span>
          )}
        </div>

        {/* Button hierarchy fix (per user spec):
            - Live Demo → ONLY filled button (accent-primary)
            - Case Study → outline/ghost button with accent-primary border and text
            - Code → subtle secondary ghost button (text-secondary, subtle border)
        */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-2">
          {caseStudySlug && (
            <Link
              href={`/work/${caseStudySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all hover:scale-105 hover:bg-blue-500/10"
              style={{
                background: 'transparent',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
              }}
            >
              Case Study
            </Link>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {liveUrl && (
              <motion.a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-3 py-2 text-xs rounded-lg"
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-ghost px-3 py-2 text-xs rounded-lg"
              >
                Code
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
