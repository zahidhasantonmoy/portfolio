'use client';

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { FaHome, FaGithub, FaLinkedin, FaEnvelope, FaFileAlt } from 'react-icons/fa';

const icons = [
    { icon: <FaHome size={24} />, href: '#home', label: 'Home' },
    { icon: <FaGithub size={24} />, href: 'https://github.com/zahidhasantonmoy', label: 'GitHub', external: true },
    { icon: <FaLinkedin size={24} />, href: 'https://www.linkedin.com/in/zahidhasantonmoy/', label: 'LinkedIn', external: true },
    { icon: <FaEnvelope size={24} />, href: '#contact', label: 'Contact' },
    { icon: <FaFileAlt size={24} />, href: '/files/Resume/Zahid_Hasan_Resume.pdf', label: 'Resume', external: true },
];

export default function FloatingDock() {
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex h-16 items-end gap-4 rounded-2xl bg-white/10 dark:bg-black/10 px-4 pb-3 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-2xl">
            {icons.map((item, i) => (
                <DockIcon key={i} mouseX={mouseX} {...item} />
            ))}
        </div>
    );
}

function DockIcon({ mouseX, icon, href, label, external }: { mouseX: MotionValue; icon: React.ReactNode; href: string; label: string; external?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
        >
            <motion.div
                ref={ref}
                style={{ width }}
                className="aspect-square w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center relative group cursor-pointer shadow-lg hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
                <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:text-white"
                >
                    {icon}
                </a>

                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {label}
                </span>
            </motion.div>
        </div>
    );
}
