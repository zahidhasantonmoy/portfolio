'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export default function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[100] bg-transparent pointer-events-none">
      <motion.div
        className="h-full bg-gradient-to-r from-[#2fd8f2] via-[#2fd8f2]/70 to-[#ffb02e] origin-left shadow-sm shadow-[#2fd8f2]/50"
        style={{ scaleX }}
      />
    </div>
  );
}
