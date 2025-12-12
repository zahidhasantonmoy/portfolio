'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillCategory {
    category: string;
    items: string[];
}

interface SkillsModernProps {
    skills: SkillCategory[];
}

const SkillsModern = ({ skills }: SkillsModernProps) => {
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', ...skills.map(s => s.category)];

    const filteredSkills = activeTab === 'All'
        ? skills.flatMap(s => s.items.map(item => ({ item, category: s.category })))
        : skills.find(s => s.category === activeTab)?.items.map(item => ({ item, category: activeTab })) || [];

    return (
        <div className="w-full py-10">
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`
              relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${activeTab === category
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }
            `}
                    >
                        {activeTab === category && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-blue-600 rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{category}</span>
                    </button>
                ))}
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto px-4"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredSkills.map((skill, index) => (
                        <motion.div
                            layout
                            key={skill.item}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="
                group relative bg-white dark:bg-gray-800 
                backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80 
                border border-gray-200 dark:border-gray-700 
                rounded-xl p-4 flex flex-col items-center justify-center 
                shadow-sm hover:shadow-xl transition-all duration-300
                aspect-square
              "
                        >
                            <div className="
                absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 
                rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
              " />

                            <div className="
                w-12 h-12 mb-3 rounded-full 
                bg-blue-100 dark:bg-blue-900/30 
                flex items-center justify-center
                text-blue-600 dark:text-blue-400 text-xl font-bold
              ">
                                {skill.item.charAt(0)}
                            </div>

                            <span className="text-center font-medium text-gray-800 dark:text-gray-200 text-sm z-10">
                                {skill.item}
                            </span>

                            <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                                {skill.category.split(' ')[0]}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default SkillsModern;
