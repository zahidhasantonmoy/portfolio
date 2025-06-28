
"use client";
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const skills = [
  { name: 'Python', level: 5, icon: '🐍' },
  { name: 'Machine Learning', level: 5, icon: '🧠' },
  { name: 'Deep Learning', level: 4, icon: '💡' },
  { name: 'TensorFlow', level: 4, icon: '⚙️' },
  { name: 'PyTorch', level: 3, icon: '🔥' },
  { name: 'Scikit-learn', level: 4, icon: '📊' },
  { name: 'Natural Language Processing', level: 3, icon: '🗣️' },
  { name: 'Computer Vision', level: 3, icon: '👁️' },
  { name: 'AI Agent Making', level: 4, icon: '🤖' },
  { name: 'WordPress', level: 5, icon: '🌐' },
  { name: 'Digital Marketing', level: 4, icon: '📈' },
  { name: 'SQL', level: 4, icon: '🗄️' },
  { name: 'Git', level: 5, icon: '🌳' },
];

const SkillTree = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);

      skills.forEach((skill, index) => {
        const angle = (index / skills.length) * 2 * Math.PI + frame * 0.01;
        const x = canvas.width / 2 + Math.cos(angle) * (canvas.width / 4);
        const y = canvas.height / 2 + Math.sin(angle) * (canvas.height / 4);

        context.beginPath();
        context.arc(x, y, skill.level * 4, 0, 2 * Math.PI);
        context.fillStyle = `rgba(0, 128, 128, ${skill.level / 5})`;
        context.fill();

        context.font = '14px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(`${skill.icon} ${skill.name}`, x, y + 5);
      });

      frame++;
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section id="skills" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          My Skills
        </motion.h2>
        <div className="relative h-96">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </section>
  );
};

export default SkillTree;
