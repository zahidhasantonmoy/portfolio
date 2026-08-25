"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface DecryptedTextProps {
    text: string;
    className?: string;
    speed?: number;
    revealSpeed?: number;
    useGradient?: boolean;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

const DecryptedText = ({
    text,
    className = "",
    speed = 50,
    revealSpeed = 100,
    useGradient = true
}: DecryptedTextProps) => {
    /**
     * CLS FIX: initialize with a full-length random scramble instead of ""
     * so the gradient span is always exactly text.length characters wide
     * from the very first paint. The animation only swaps glyphs — it never
     * changes the element's box dimensions — eliminating all layout shifts.
     */
    const [displayText, setDisplayText] = useState<string>(() =>
        Array.from({ length: text.length }, () =>
            characters[Math.floor(Math.random() * characters.length)]
        ).join('')
    );
    const [isRevealed, setIsRevealed] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const revealIndexRef = useRef(0);

    useEffect(() => {
        // Start with all random characters
        let currentIteration = 0;
        revealIndexRef.current = 0;
        setIsRevealed(false);

        const scramble = () => {
            let scrambled = "";
            for (let i = 0; i < text.length; i++) {
                if (i < revealIndexRef.current) {
                    scrambled += text[i];
                } else {
                    scrambled += characters[Math.floor(Math.random() * characters.length)];
                }
            }
            setDisplayText(scrambled);

            // Progressive reveal
            if (currentIteration > 10 && currentIteration % 2 === 0) {
                if (revealIndexRef.current < text.length) {
                    revealIndexRef.current++;
                }
            }

            currentIteration++;

            if (revealIndexRef.current >= text.length) {
                setDisplayText(text); // Ensure final match
                setIsRevealed(true);
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };

        intervalRef.current = setInterval(scramble, speed);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text, speed]);

    return (
        <span className={`${className} inline-block`}>
            {useGradient ? (
                /*
                 * animate-pulse removed: opacity keyframes on a bg-clip-text
                 * element cause repeated compositor repaints that Chrome can
                 * register as visual instability. The scramble animation itself
                 * is visually interesting enough without the pulse.
                 */
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                    {displayText}
                </span>
            ) : (
                <span>{displayText}</span>
            )}
        </span>
    );
};

export default DecryptedText;
