'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TypewriterTextProps {
    texts: string[];
    typingSpeed?: number;
    deleteSpeed?: number;
    delay?: number;
    className?: string;
}

const TypewriterText = ({
    texts,
    typingSpeed = 100,
    deleteSpeed = 50,
    delay = 1500,
    className = ""
}: TypewriterTextProps) => {
    const [displayText, setDisplayText] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const currentText = texts[textIndex % texts.length];

        // Calculate duration based on text length and speed
        const duration = isDeleting
            ? (currentText.length * deleteSpeed) / 1000
            : (currentText.length * typingSpeed) / 1000;

        const controls = animate(count, isDeleting ? 0 : currentText.length, {
            type: "tween",
            duration: duration,
            ease: "linear",
            onUpdate: (latest) => {
                setDisplayText(currentText.slice(0, Math.round(latest)));
            },
            onComplete: () => {
                if (!isDeleting) {
                    // Finished typing, wait then delete
                    setTimeout(() => setIsDeleting(true), delay);
                } else {
                    // Finished deleting, move to next text
                    setIsDeleting(false);
                    setTextIndex((prev) => prev + 1);
                }
            }
        });

        return controls.stop;
    }, [textIndex, isDeleting, texts, typingSpeed, deleteSpeed, delay, count]);

    return (
        <span className={className}>
            {displayText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block ml-1 w-[2px] h-[1em] bg-current align-middle"
            />
        </span>
    );
};

export default TypewriterText;
