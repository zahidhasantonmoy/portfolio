import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link: string;
}

const ProjectCard = ({ title, description, image, technologies, link }: ProjectCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl"
    >
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        <motion.a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Project
        </motion.a>
      </div>
    </motion.div>
  );
};

export default ProjectCard; 