"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { useFilter } from '@/context/FilterContext';
import { useAudio } from '@/hooks/useAudio';

interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  githubUrl: string;
  liveUrl: string;
  category: string;
  technologies?: string[];
}

interface ProjectsProps {
  projects: Project[];
}

const Projects = ({ projects }: ProjectsProps) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const { selectedSkill } = useFilter();
  const { playClick } = useAudio();

  // Extract unique categories and add 'All'
  const rawCategories = Array.from(new Set(projects.map((project) => project.category || 'General')));
  const categories = ['All', ...rawCategories];

  const getCategoryCount = (cat: string) => {
    if (cat === 'All') return projects.length;
    return projects.filter((p) => (p.category || 'General') === cat).length;
  };

  // Logic: 
  // 1. Filter by Category first (existing behavior)
  // 2. Then visually highlight/dim based on selectedSkill
  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((project) => (project.category || 'General') === selectedCategory);

  return (
    <section id="projects" className="py-20 transition-colors duration-300" style={{ background: 'var(--bg-base)' }}>
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Projects
        </motion.h2>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mb-12">
          {categories.map((category) => {
            const count = getCategoryCount(category);
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  playClick();
                  setSelectedCategory(category);
                }}
                className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isSelected
                    ? 'text-white shadow-lg shadow-[var(--glow-primary)] scale-105'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent-primary)]'
                }`}
                style={!isSelected ? { background: 'var(--bg-surface)' } : undefined}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeProjectCategory"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{category}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono transition-colors ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'text-[var(--text-secondary)]'
                  }`}
                  style={!isSelected ? { background: 'var(--bg-surface-hover)' } : undefined}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Filter Indicator */}
        <AnimatePresence>
          {selectedSkill && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="text-center mb-8"
            >
              <span className="inline-block px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)' }}>
                Highlighting projects using: {selectedSkill}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => {
            // Determine highlight state
            const isDimmed = selectedSkill
              ? !project.technologies?.some(t => t.toLowerCase() === selectedSkill.toLowerCase())
              : false;

            return (
              <motion.div
                key={project.id}
                layoutId={`project-${project.id}`}
                layout
                animate={{
                  opacity: isDimmed ? 0.3 : 1,
                  scale: isDimmed ? 0.95 : 1,
                  filter: isDimmed ? 'grayscale(100%)' : 'grayscale(0%)'
                }}
                transition={{ duration: 0.4 }}
              >
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  images={project.images}
                  technologies={project.technologies || []}
                  liveUrl={project.liveUrl}
                  githubUrl={project.githubUrl}
                  onClick={() => {
                    playClick();
                    setSelectedProject(project);
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {selectedProject && (
            <ProjectModal
              project={selectedProject}
              isOpen={!!selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Projects;
