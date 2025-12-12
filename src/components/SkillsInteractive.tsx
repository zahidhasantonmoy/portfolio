'use client';

import { useEffect, useRef, useState } from 'react';
import TagCloud from 'TagCloud';
import { motion } from 'framer-motion';

interface SkillCategory {
    category: string;
    items: string[];
}

interface SkillsInteractiveProps {
    skills: SkillCategory[];
}

const SkillsInteractive = ({ skills }: SkillsInteractiveProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.innerHTML = '';

            const allSkills = skills.flatMap(c => c.items);
            const texts = allSkills.length > 0 ? allSkills : ['HTML', 'CSS', 'JS', 'React', 'Node'];

            const options = {
                radius: 300,
                maxSpeed: 'normal',
                initSpeed: 'normal',
                direction: 135,
                keep: true,
                useContainerInlineStyles: false,
                containerClass: 'tagcloud-container',
                itemClass: 'tagcloud-item',
            };

            try {
                // @ts-ignore
                TagCloud(containerRef.current, texts, options);
            } catch (error) {
                console.error("TagCloud init failed:", error);
            }
        }
    }, [skills]);

    // Force radius adjustment on resize could be added here, but CSS transform is easier for responsive

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 min-h-[600px] py-10">

            {/* Left Side: Categories & List */}
            <div className="w-full lg:w-1/2 space-y-8">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 dark:bg-opacity-50 backdrop-blur-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl"
                >
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
                        Technical Expertise
                    </h3>

                    <div className="space-y-6">
                        {skills.map((skillGroup, idx) => (
                            <motion.div
                                key={skillGroup.category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onMouseEnter={() => setSelectedCategory(skillGroup.category)}
                                onMouseLeave={() => setSelectedCategory(null)}
                                className={`
                  p-4 rounded-xl transition-all duration-300 border
                  ${selectedCategory === skillGroup.category
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 transform scale-102'
                                        : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                `}
                            >
                                <h4 className="flex items-center gap-3 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                    <span className={`w-2 h-8 rounded-full bg-gradient-to-b ${idx === 0 ? 'from-blue-500 to-cyan-400' :
                                            idx === 1 ? 'from-purple-500 to-pink-400' :
                                                idx === 2 ? 'from-green-500 to-emerald-400' :
                                                    'from-orange-500 to-yellow-400'
                                        }`} />
                                    {skillGroup.category}
                                </h4>
                                <div className="flex flex-wrap gap-2 pl-5">
                                    {skillGroup.items.map((item) => (
                                        <span
                                            key={item}
                                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Side: 3D Sphere */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Glowing background effect */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />

                    <div
                        ref={containerRef}
                        className="
              relative z-10 
              text-lg font-bold 
              text-gray-600 dark:text-gray-300 
              cursor-pointer 
              [&_.tagcloud-item:hover]:text-blue-500 
              [&_.tagcloud-item:hover]:scale-125 
              [&_.tagcloud-item]:transition-all 
              [&_.tagcloud-item]:duration-300
            "
                    />
                </motion.div>
            </div>

            <style jsx global>{`
        .tagcloud-container {
          font-family: 'Inter', sans-serif;
        }
        .tagcloud-item {
          display: inline-block;
          will-change: transform, opacity;
        }
      `}</style>
        </div>
    );
};

export default SkillsInteractive;
