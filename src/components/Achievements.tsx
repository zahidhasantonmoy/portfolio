'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const achievements = [
  {
    title: 'Literary and Cultural Competition - 2019',
    description: 'Hamd and Nat category',
    image: '/images/certificates/Hamd, Nat.jpg',
    date: '2019',
    institution: 'Dhaka Uddan Government College',
    category: 'Hamd and Nat',
    location: 'Dhaka',
    position: '3rd Position'
  },
  {
    title: 'Literary and Cultural Competition - 2019',
    description: 'Folk Song category',
    image: '/images/certificates/Folk Song.jpg',
    date: '2019',
    institution: 'Dhaka Uddan Government College',
    category: 'Folk Song',
    location: 'Dhaka',
    position: '3rd Position'
  },
  {
    title: 'Creative Talent Search - 2019',
    description: 'Best Talent of the Year',
    image: '/images/certificates/Creative Talent Search.jpg',
    date: '2019',
    institution: 'Dhaka Uddan Government College',
    category: 'Best Talent',
    location: 'Dhaka',
    position: 'Best Talent of the Year',
    level: 'Dhaka Metropolitan Education Region'
  },
  {
    title: 'Brainstorming Week 2024',
    description: 'Project Showcase',
    image: '/images/certificates/Project Showcase.jpg',
    date: '2024',
    institution: 'Bangladesh University of Business and Technology',
    category: 'Project Showcase',
    location: 'Dhaka',
    position: '2nd Position'
  },
  {
    title: 'Brainstorming Week 2024',
    description: 'Software Development Competition',
    image: '/images/certificates/Software Development Competition.jpg',
    date: '2024',
    institution: 'Bangladesh University of Business and Technology',
    category: 'Software Development',
    location: 'Dhaka'
  }
];

export default function Achievements() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <section id="achievements" className="py-20 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Achievements & Certificates</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">My academic and professional accomplishments</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 w-full group">
                <Image
                  src={achievement.image}
                  alt={achievement.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => {
                      setSelectedImage(achievement.image);
                      resetView();
                    }}
                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
                  >
                    View Certificate
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{achievement.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{achievement.description}</p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p><span className="font-semibold">Institution:</span> {achievement.institution}</p>
                  <p><span className="font-semibold">Category:</span> {achievement.category}</p>
                  <p><span className="font-semibold">Location:</span> {achievement.location}</p>
                  <p><span className="font-semibold">Date:</span> {achievement.date}</p>
                  {achievement.position && (
                    <p><span className="font-semibold">Position:</span> {achievement.position}</p>
                  )}
                  {achievement.level && (
                    <p><span className="font-semibold">Level:</span> {achievement.level}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Modal for full-screen image */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full max-w-5xl h-[80vh]">
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetView();
                  }}
                  className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div
                className="relative w-full h-full overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    scale,
                    x: position.x,
                    y: position.y,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  <Image
                    src={selectedImage}
                    alt="Certificate"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}