'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

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

interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
    if (!project || !isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                layoutId={`project-${project.id}`}
                className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                {/* Image Header */}
                <div className="relative w-full h-64 md:h-96">
                    <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />
                    <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-3 py-1 bg-blue-600 rounded-full text-xs font-semibold mb-3 border border-blue-400/30"
                        >
                            {project.category}
                        </motion.span>
                        <motion.h2
                            layoutId={`title-${project.id}`}
                            className="text-3xl md:text-5xl font-bold"
                        >
                            {project.title}
                        </motion.h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 space-y-8">

                    {/* Description */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About the Project</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </div>

                    {/* Tech Stack */}
                    {project.technologies && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Technologies Used</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech) => (
                                    <span key={tech} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery (Simple Grid for now, could be slider) */}
                    {project.images.length > 1 && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Gallery</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {project.images.slice(1).map((img, idx) => (
                                    <div key={idx} className="relative h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <Image
                                            src={img}
                                            alt={`${project.title} screenshot ${idx + 2}`}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-800">
                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <FaExternalLinkAlt /> Live Demo
                            </a>
                        )}
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
                            >
                                <FaGithub size={20} /> View Source
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProjectModal;
