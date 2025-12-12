"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NotFound() {
    const router = useRouter();
    const [text, setText] = useState('');
    const [showRedirect, setShowRedirect] = useState(false);

    const fullText = `> DETECTING UNAUTHORIZED ACCESS...\n> ANALYZING USER AGENT...\n> TRACING IP ADDRESS...\n> SECURITY BREACH CONFIRMED.\n> INITIATING CONTAINMENT PROTOCOL...\n> GRANTING AMNESTY...\n> REDIRECTING TO SAFE ZONE...`;

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < fullText.length) {
                setText(prev => prev + fullText[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(interval);
                setShowRedirect(true);
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            }
        }, 40); // Typewriter speed

        return () => clearInterval(interval);
    }, [fullText, router]);

    return (
        <div className="min-h-screen bg-black text-red-600 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-red-900 selection:text-white">
            {/* Background Matrix/Static Effect */}
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-5 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />

            {/* Main Terminal Overlay */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-2xl bg-black/90 border border-red-600/50 p-6 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.3)]"
            >
                <div className="flex items-center justify-between border-b border-red-900/50 pb-2 mb-4">
                    <span className="text-xs tracking-widest uppercase">⚠️ Security Alert</span>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-red-900/50" />
                        <div className="w-3 h-3 rounded-full bg-red-900/50" />
                    </div>
                </div>

                <div className="h-64 overflow-y-auto font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {text}
                    <span className="animate-pulse">_</span>
                </div>

                {showRedirect && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 border-t border-red-900/50 pt-4 flex flex-col items-center"
                    >
                        <p className="text-white mb-4 text-sm animate-pulse">Establishing secure connection to Homepage...</p>
                        <div className="w-full bg-red-900/20 h-1 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5 }}
                                className="h-full bg-red-600"
                            />
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Emergency Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="mt-12 z-10 px-6 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-black transition-colors rounded uppercase text-xs tracking-widest"
            >
                [ Emergency Exit ]
            </motion.button>
        </div>
    );
}
