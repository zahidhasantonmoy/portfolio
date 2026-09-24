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

// Color mapping using accent tokens
const getCategoryGradient = (index: number) => {
    const gradients = [
        'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
        'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))',
        'linear-gradient(135deg, var(--success), var(--accent-secondary))',
        'linear-gradient(135deg, var(--accent-primary), var(--success))',
    ];
    return gradients[index % gradients.length];
};

const SkillsInteractive = ({ skills }: SkillsInteractiveProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { setSelectedSkill, selectedSkill } = useFilter();
    // Keep a ref to selectedSkill so the click handler always reads the latest value
    const selectedSkillRef = useRef(selectedSkill);
    selectedSkillRef.current = selectedSkill;
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = '';

        const allSkills = skills.flatMap(c => c.items);
        const texts = allSkills.length > 0 ? allSkills : ['HTML', 'CSS', 'JS', 'React', 'Node'];

        const options = {
            radius: typeof window !== 'undefined' && window.innerWidth < 640 ? 120 : typeof window !== 'undefined' && window.innerWidth < 1024 ? 200 : 300,
            maxSpeed: 'normal',
            initSpeed: 'normal',
            direction: 135,
            keep: true,
            useContainerInlineStyles: false,
            containerClass: 'tagcloud-container',
            itemClass: 'tagcloud-item',
        };

        let clickHandler: ((e: Event) => void) | null = null;
        let tagContainer: Element | null = null;

        try {
            // @ts-ignore
            TagCloud(containerRef.current, texts, options);

            tagContainer = containerRef.current.querySelector('.tagcloud-container');
            if (tagContainer) {
                clickHandler = (e: Event) => {
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('tagcloud-item')) {
                        const text = target.innerText;
                        setSelectedSkill(selectedSkillRef.current === text ? null : text);
                    }
                };
                tagContainer.addEventListener('click', clickHandler);
            }
        } catch (error) {
            console.error("TagCloud init failed:", error);
        }

        return () => {
            if (tagContainer && clickHandler) {
                tagContainer.removeEventListener('click', clickHandler);
            }
        };
    }, [skills]);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 min-h-[400px] lg:min-h-[600px] py-6 sm:py-10">

            {/* Left Side: Categories & List */}
            <div className="w-full lg:w-1/2 space-y-4 sm:space-y-8">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass-card rounded-2xl p-5 sm:p-8"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl sm:text-2xl font-bold gradient-text">
                            Technical Expertise
                        </h3>
                        {selectedSkill && (
                            <button
                                onClick={() => setSelectedSkill(null)}
                                className="text-xs font-semibold"
                                style={{ color: '#EF4444' }}
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
                                className="p-4 rounded-xl transition-all duration-300 border relative overflow-hidden group"
                                style={{
                                    background: activeCategory === skillGroup.category ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                    borderColor: activeCategory === skillGroup.category ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                                }}
                            >
                                <div className="flex items-center gap-4 mb-3 relative z-10">
                                    <div
                                        className="p-2 rounded-lg text-white shadow-lg"
                                        style={{ background: getCategoryGradient(idx) }}
                                    >
                                        {getCategoryIcon(skillGroup.category)}
                                    </div>
                                    <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
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
                                            className="px-3 py-1 text-sm rounded-full transition-all duration-200"
                                            style={{
                                                background: selectedSkill === item ? 'var(--accent-primary)' : 'var(--bg-surface-hover)',
                                                color: selectedSkill === item ? 'white' : 'var(--text-secondary)',
                                                transform: selectedSkill === item ? 'scale(1.05)' : 'scale(1)',
                                                boxShadow: selectedSkill === item ? '0 4px 12px var(--glow-primary)' : 'none',
                                            }}
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
                        style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.15 }}
                    />

                    <div
                        ref={containerRef}
                        className="relative z-10 text-lg font-bold cursor-pointer transition-colors duration-500"
                        style={{ color: 'var(--text-secondary)' }}
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
          transition: color 0.2s ease;
        }
        .tagcloud-item:hover {
          color: var(--accent-primary) !important;
          transform: scale(1.2);
        }
        .tagcloud-item {
            color: inherit; 
        }
      `}</style>
        </div>
    );
};

export default SkillsInteractive;
