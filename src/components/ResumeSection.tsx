import { motion } from 'framer-motion';
import GradientText from './GradientText';

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
}

interface Education {
  degree: string;
  institution: string;
  period: string;
  description: string;
}

const experiences: Experience[] = [
  {
    title: "Senior Frontend Developer",
    company: "Tech Solutions Inc.",
    period: "2022 - Present",
    description: "Leading frontend development team and implementing modern web technologies.",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"]
  },
  {
    title: "Frontend Developer",
    company: "Digital Innovations",
    period: "2020 - 2022",
    description: "Developed responsive web applications using modern frameworks.",
    skills: ["React", "JavaScript", "CSS", "Node.js"]
  }
];

const education: Education[] = [
  {
    degree: "Bachelor of Science in Computer Science",
    institution: "University of Technology",
    period: "2016 - 2020",
    description: "Graduated with First Class Honours"
  }
];

const ResumeSection = () => {
  return (
    <section id="resume" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <GradientText text="My Resume" className="text-4xl font-bold mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Professional experience and education
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Experience Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8">
              Experience
            </h3>
            <div className="space-y-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {exp.title}
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 mb-2">
                    {exp.company}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    {exp.period}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8">
              Education
            </h3>
            <div className="space-y-8">
              {education.map((edu, index) => (
                <motion.div
                  key={edu.degree}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {edu.degree}
                  </h4>
                  <p className="text-blue-600 dark:text-blue-400 mb-2">
                    {edu.institution}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    {edu.period}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {edu.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a
            href="/resume.pdf"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            download
          >
            Download Resume
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ResumeSection; 