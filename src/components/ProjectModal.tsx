"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaTimes } from 'react-icons/fa';
import Image from 'next/image';

interface Project {
    id: string;
    title: string;
    description: string;
    images: string[];
    technologies?: string[];
    liveUrl?: string;
    githubUrl?: string;
    category?: string;
}

interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
    if (!project) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gray-900 rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-64 md:h-96 w-full">
                            <Image
                                src={project.images[0] || '/images/placeholder.jpg'}
                                alt={project.title}
                                layout="fill"
                                objectFit="cover"
                            />
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{project.title}</h3>
                                    {project.category && (
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                                            {project.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-4 mt-4 md:mt-0">
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                        >
                                            <FaGithub size={24} />
                                            <span className="hidden md:inline">Source Code</span>
                                        </a>
                                    )}
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                        >
                                            <FaExternalLinkAlt size={16} />
                                            <span>Live Demo</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none mb-8">
                                <p className="text-gray-300 leading-relaxed text-lg">{project.description}</p>
                            </div>

                            {project.technologies && (
                                <div>
                                    <h4 className="text-xl font-semibold text-white mb-4">Technologies Used</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {project.technologies.map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProjectModal;
