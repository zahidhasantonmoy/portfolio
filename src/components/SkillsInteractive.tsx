'use client';

import { useEffect, useRef, useState } from 'react';
import TagCloud from 'TagCloud';
import { motion } from 'framer-motion';
import { useFilter } from '@/context/FilterContext';
import { FaCode, FaLaptopCode, FaDatabase, FaBullhorn, FaLayerGroup } from 'react-icons/fa';

interface SkillCategory {
    category: string;
    items: string[];
}

interface SkillsInteractiveProps {
    skills: SkillCategory[];
}

// Icon mapping helper
const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('web')) return <FaCode />;
    if (lower.includes('framework') || lower.includes('program')) return <FaLaptopCode />;
    if (lower.includes('data') || lower.includes('ai')) return <FaDatabase />;
    if (lower.includes('marketing')) return <FaBullhorn />;
    return <FaLayerGroup />;
};

// Color mapping (can be extended)
const getCategoryColor = (index: number) => {
    const colors = [
        '#3b82f6', // blue-500
        '#a855f7', // purple-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
    ];
    return colors[index % colors.length];
};

const SkillsInteractive = ({ skills }: SkillsInteractiveProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { setSelectedSkill, selectedSkill } = useFilter();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
                const tc = TagCloud(containerRef.current, texts, options);

                // Add click listeners to tag cloud items manually since the library might not expose strict events easily in React
                // tailored approach: delegate click on container
                const container = containerRef.current.querySelector('.tagcloud-container');
                if (container) {
                    container.addEventListener('click', (e: any) => {
                        if (e.target.classList.contains('tagcloud-item')) {
                            const text = e.target.innerText;
                            setSelectedSkill(selectedSkill === text ? null : text);
                        }
                    });
                }

            } catch (error) {
                console.error("TagCloud init failed:", error);
            }
        }
    }, [skills]);


    // Determine active color for sphere text based on hover
    const activeColor = activeCategory
        ? getCategoryColor(skills.findIndex(s => s.category === activeCategory))
        : '#6b7280'; // gray-500 default

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
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            Technical Expertise
                        </h3>
                        {selectedSkill && (
                            <button
                                onClick={() => setSelectedSkill(null)}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                            >
                                Clear Filter: {selectedSkill}
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {skills.map((skillGroup, idx) => (
                            <motion.div
                                key={skillGroup.category}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onMouseEnter={() => setActiveCategory(skillGroup.category)}
                                onMouseLeave={() => setActiveCategory(null)}
                                className={`
                  p-4 rounded-xl transition-all duration-300 border relative overflow-hidden group
                  ${activeCategory === skillGroup.category
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 transform scale-102'
                                        : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                `}
                            >
                                <div className="flex items-center gap-4 mb-3 relative z-10">
                                    <div className={`
                    p-2 rounded-lg text-white shadow-lg
                    ${idx === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-400' :
                                            idx === 1 ? 'bg-gradient-to-br from-purple-500 to-pink-400' :
                                                idx === 2 ? 'bg-gradient-to-br from-green-500 to-emerald-400' :
                                                    'bg-gradient-to-br from-orange-500 to-yellow-400'}
                  `}>
                                        {getCategoryIcon(skillGroup.category)}
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        {skillGroup.category}
                                    </h4>
                                </div>

                                <div className="flex flex-wrap gap-2 pl-14 relative z-10">
                                    {skillGroup.items.map((item) => (
                                        <button
                                            key={item}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSkill(selectedSkill === item ? null : item);
                                            }}
                                            className={`
                        px-3 py-1 text-sm rounded-full transition-all duration-200
                        ${selectedSkill === item
                                                    ? 'bg-blue-600 text-white shadow-md scale-105'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                      `}
                                        >
                                            {item}
                                        </button>
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
                    <div
                        className="absolute inset-0 blur-[100px] rounded-full animate-pulse transition-colors duration-500"
                        style={{ backgroundColor: activeCategory ? activeColor : '#3b82f6', opacity: 0.2 }}
                    />

                    <div
                        ref={containerRef}
                        className="
              relative z-10 
              text-lg font-bold 
              cursor-pointer 
              transition-colors duration-500
            "
                        style={{ color: activeCategory ? activeColor : undefined }} // "Sync Color" logic
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
          cursor: pointer;
        }
        .tagcloud-item:hover {
          color: ${activeCategory ? activeColor : '#3b82f6'};
          transform: scale(1.2);
        }
        /* Default generic color if internal style not applied */
        .tagcloud-item {
            color: inherit; 
        }
      `}</style>
        </div>
    );
};

export default SkillsInteractive;
