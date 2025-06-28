
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const achievements = [
  {
    title: 'Creative Talent Search',
    image: '/images/certificates/Creative Talent Search.jpg',
    category: 'Creative Arts',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Folk Song',
    image: '/images/certificates/Folk Song.jpg',
    category: 'Cultural Performance',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Hamd, Nat',
    image: '/images/certificates/Hamd, Nat.jpg',
    category: 'Religious Performance',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Project Showcase',
    image: '/images/certificates/Project Showcase.jpg',
    category: 'Technology Exhibition',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'Software Development Competition',
    image: '/images/certificates/Software Development Competition.jpg',
    category: 'Software Development Competition',
    location: 'Dhaka',
    certificateStatus: 'Included',
  },
  {
    title: 'New Software Development Achievement',
    image: '/images/certificates/Software Development Competition.jpg', // Using an existing image as a placeholder
    category: 'Software Development',
    location: 'Dhaka',
    date: '2024',
    certificateStatus: 'Included',
  },
];

const Achievements = () => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <section id="achievements" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Credentials
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer"
              onClick={() => setSelectedImg(achievement.image)}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Image
                src={achievement.image}
                alt={achievement.title}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-center text-white">{achievement.title}</h3>
                {achievement.category && <p className="text-sm text-gray-400 text-center">Category: {achievement.category}</p>}
                {achievement.location && <p className="text-sm text-gray-400 text-center">Location: {achievement.location}</p>}
                {achievement.date && <p className="text-sm text-gray-400 text-center">Date: {achievement.date}</p>}
                {achievement.certificateStatus && <p className="text-sm text-gray-400 text-center">Certificate: {achievement.certificateStatus}</p>}
              </div>
            </motion.div>
          ))}
        </div>

        {selectedImg && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setSelectedImg(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <Image
                src={selectedImg}
                alt="Selected Certificate"
                width={800}
                height={600}
                className="max-w-full max-h-full rounded-lg"
              />
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Achievements;
