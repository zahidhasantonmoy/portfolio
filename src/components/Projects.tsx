'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const projects = [
  {
    title: 'OffenseOrbit',
    description: 'A comprehensive platform for managing and tracking offenses. Features include user authentication, offense reporting, tracking system, and admin dashboard for efficient management. Built with modern web technologies and a focus on user experience. The system allows users to report offenses, track their status, and administrators to manage cases effectively.',
    image: '/images/project image/offenseorbit.png',
    link: 'https://offenseorbit.free.nf',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Tailwind CSS', 'JWT Authentication'],
    features: [
      'User Authentication & Authorization',
      'Offense Reporting System',
      'Real-time Status Tracking',
      'Admin Dashboard',
      'Case Management System',
      'User Profile Management',
      'Search & Filter Functionality',
      'Responsive Design'
    ]
  },
  {
    title: 'Halarnati',
    description: 'A platform dedicated to managing and tracking halal food items. Includes features for product listing, halal certification verification, and user reviews. Focuses on providing accurate information about halal products. The system helps users find and verify halal products while allowing businesses to showcase their certified products.',
    image: '/images/project image/halarnati.png',
    link: 'https://halarnati.free.nf',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Tailwind CSS', 'Image Upload'],
    features: [
      'Product Listing & Management',
      'Halal Certification Verification',
      'User Reviews & Ratings',
      'Advanced Search Functionality',
      'Admin Panel',
      'Product Categories',
      'Business Profiles',
      'Mobile Responsive Design'
    ]
  }
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">My Projects</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="relative h-48">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {project.description}
                </p>
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Key Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    {project.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  View Project
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}