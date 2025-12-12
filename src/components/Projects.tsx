"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import { useFilter } from '@/context/FilterContext';

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

  // Extract unique categories and add 'All'
  const categories = ['All', ...Array.from(new Set(projects.map((project) => project.category)))];

  // Logic: 
  // 1. Filter by Category first (existing behavior)
  // 2. Then visually highlight/dim based on selectedSkill
  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((project) => project.category === selectedCategory);

  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Projects
        </motion.h2>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              {category}
            </button>
          ))}
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
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-semibold">
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
                  onClick={() => setSelectedProject(project)}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <ProjectModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
};

export default Projects;
