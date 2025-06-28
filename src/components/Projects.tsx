
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const projects = [
  {
    title: 'OffenseOrbit: AI-Powered Threat Intelligence Platform',
    description: 'A platform for real-time offensive security monitoring and threat intelligence. This project involved designing scalable data pipelines, implementing anomaly detection algorithms, and visualizing complex security data to provide actionable insights for cybersecurity professionals.',
    image: '/images/project image/offenseorbit.png',
    liveLink: '#',
    sourceLink: 'https://github.com/zahidhasantonmoy/OffenseOrbit',
  },
  {
    title: 'Halal Nati: E-commerce with AI-Driven Recommendations',
    description: 'An e-commerce platform for halal products, featuring a custom-built recommendation engine that personalizes user experience and boosts sales. The project focused on seamless user journeys, secure payment integrations, and data-driven product suggestions to enhance customer satisfaction and retention.',
    image: '/images/project image/halarnati.png',
    liveLink: '#',
    sourceLink: 'https://github.com/zahidhasantonmoy/Halal-Nati',
  },
  {
    title: 'Gold Price Predictor: Machine Learning Application',
    description: 'Developed a machine learning application to predict gold prices. This project involved data collection, feature engineering, model training (using algorithms like Linear Regression, Random Forest), and evaluation to provide accurate price forecasts.',
    image: '/images/project image/default-project.png', // Placeholder image
    liveLink: '#',
    sourceLink: 'https://github.com/zahidhasantonmoy/Gold-Price-Predictor-Machine-Learning-app',
  },
  {
    title: 'Snake Detection: Computer Vision Project',
    description: 'A computer vision project focused on detecting snakes in images or video streams. This involved training a deep learning model (e.g., using TensorFlow or PyTorch) on a custom dataset, and implementing image processing techniques for accurate detection.',
    image: '/images/project image/default-project.png', // Placeholder image
    liveLink: '#',
    sourceLink: 'https://github.com/zahidhasantonmoy/snakedetection',
  },
  {
    title: 'Flexpath: Flutter-based Android App',
    description: 'Developed a mobile application using Flutter for Android. This project showcases cross-platform mobile development skills, focusing on UI/UX design, state management, and integration with backend services.',
    image: '/images/project image/default-project.png', // Placeholder image
    liveLink: '#',
    sourceLink: 'https://github.com/zahidhasantonmoy/Flexpath',
  },
];

const Projects = () => {
  return (
    <section id="projects" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Projects
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Image
                src={project.image}
                alt={project.title}
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 text-white">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex justify-between">
                  <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Live Demo</a>
                  <a href={project.sourceLink} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Source Code</a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
