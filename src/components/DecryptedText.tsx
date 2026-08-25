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
    const [displayText, setDisplayText] = useState<string>(text);
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
        /*
         * CLS fix — ghost + absolute overlay pattern:
         *
         * The OUTER span is `relative inline-block`. Its box geometry is
         * determined entirely by the GHOST span below (the final settled `text`
         * prop rendered invisibly in normal document flow). This box NEVER
         * changes size, because `text` is a stable prop.
         *
         * The ANIMATED span is `absolute inset-0`. It fills the stable parent
         * box exactly, so when scramble chars fluctuate between wide glyphs
         * (M, W, @) and narrow ones (i, l, !) the animated span's own internal
         * width oscillations are fully contained — they never shift any tracked
         * box geometry in the layout tree.
         */
        <span className={`${className} relative inline-block`}>
            {/* Ghost: final text in normal flow — gives the wrapper its stable size */}
            <span className="invisible select-none" aria-hidden="true">{text}</span>
            {/* Animated overlay: absolutely fills the ghost-sized box */}
            {useGradient ? (
                <span className="absolute inset-0 flex items-center justify-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                    {displayText}
                </span>
            ) : (
                <span className="absolute inset-0 flex items-center justify-center">
                    {displayText}
                </span>
            )}
        </span>
    );
};

export default DecryptedText;
