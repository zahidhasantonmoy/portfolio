"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { FaGithub, FaLinkedin, FaFacebook, FaTwitter, FaBrain, FaDatabase, FaChartLine, FaMedium, FaDev, FaCoffee } from 'react-icons/fa';
import GradientText from './GradientText';
import TypewriterText from './TypewriterText';
import DecryptedText from './DecryptedText';

interface HeroProps {
  name: string;
  title: string;
}

const Hero = ({ name, title }: HeroProps) => {
  const containerRef = useRef<HTMLElement>(null);

  // Parallax Mouse Stuff
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = clientX / innerWidth - 0.5;
    const y = clientY / innerHeight - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  // Smooth springs for parallax
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Layer transforms (opposite directions for depth)
  const layer1X = useTransform(springX, [-0.5, 0.5], [20, -20]);
  const layer1Y = useTransform(springY, [-0.5, 0.5], [20, -20]);

  const layer2X = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const layer2Y = useTransform(springY, [-0.5, 0.5], [-40, 40]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
    hover: {
      scale: 1.2,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen py-24 sm:py-28 md:py-0 flex items-center justify-center text-center overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Radial gradient accent glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, var(--accent-primary), transparent 70%)' }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, var(--accent-secondary), transparent 70%)' }}
        />

        {/* Animated Grid/Pattern - Parallax Layer 1 */}
        <motion.div
          className="absolute inset-0 bg-grid-pattern opacity-[0.05]"
          style={{ x: layer1X, y: layer1Y }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        ></motion.div>

        {/* Abstract Data Flow / Neural Network Lines */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M0,10 Q50,0 100,10 T0,20 Q50,30 100,40 T0,50 Q50,60 100,70 T0,80 Q50,90 100,100"
              stroke="url(#gradient1)"
              strokeWidth="0.3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.path
              d="M100,0 Q50,10 0,20 T100,30 Q50,40 0,50 T100,60 Q50,70 0,80 T100,90 Q50,100 0,100"
              stroke="url(#gradient2)"
              strokeWidth="0.3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-secondary)" />
                <stop offset="100%" stopColor="var(--accent-primary)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Iconic Overlays - Parallax Layer 2 */}
        <motion.div
          className="absolute top-1/4 left-1/4"
          style={{ x: layer2X, y: layer2Y, color: 'var(--accent-primary)', opacity: 0.03 }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <FaBrain size={150} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4"
          style={{ x: layer2X, y: layer2Y, color: 'var(--accent-secondary)', opacity: 0.03 }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <FaDatabase size={150} />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ x: layer1X, y: layer1Y, color: 'var(--accent-primary)', opacity: 0.03 }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 180 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <FaChartLine size={150} />
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center p-4"
        style={{ color: 'var(--text-primary)' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Image with accent gradient glow ring */}
        <motion.div variants={itemVariants} className="mb-5 sm:mb-6 relative w-36 h-36 sm:w-52 sm:h-52 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src="/images/profile.jpg"
            alt="Zahid Hasan Tonmoy — profile photo"
            fill
            sizes="(max-width: 640px) 144px, 208px"
            priority
            className="object-cover transform hover:scale-105 transition-transform duration-300 ease-in-out"
          />
          {/* Accent gradient glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            animate={{
              boxShadow: [
                "0 0 15px rgba(59,130,246,0.7)",
                "0 0 25px rgba(6,182,212,0.7)",
                "0 0 15px rgba(59,130,246,0.7)"
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
        </motion.div>

        {/* Live "Available for Freelance" pulsing badge — uses --success (Von Restorff) */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-5 backdrop-blur-md cursor-default transition-all duration-300"
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: 'var(--success)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.18)',
          }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="font-semibold tracking-wide">Available for Freelance & Full-time Roles</span>
        </motion.div>

        {/*
          CLS fix for h1: render the real name text as an invisible spacer so the
          container is always the correct intrinsic width, then overlay the
          animated DecryptedText on top. This prevents the browser from seeing a
          zero-width element that later expands.
        */}
        <motion.h1
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-2 drop-shadow-lg relative w-full text-center tracking-tight"
          variants={heroItemVariants}
        >
          {/* Invisible spacer — reserves the final width/height from first paint */}
          <span className="invisible select-none" aria-hidden="true">{name}</span>
          {/* Animated overlay — absolutely positioned so it never contributes to layout */}
          <span className="absolute inset-0 flex items-center justify-center gradient-text">
            <DecryptedText text={name} speed={30} revealSpeed={50} />
          </span>
        </motion.h1>

        {/*
          CLS fix for rotating role subtitle:
          Ghost copies of every possible string are rendered as
          position:absolute so they never affect document flow, but they
          DO force the inline-block container to size itself to the
          widest variant ('AI Agent Developer') from the first paint.
          The live TypewriterText then renders on top at the same fixed size.
        */}
        <motion.div
          className="text-lg sm:text-2xl md:text-4xl font-light leading-relaxed mb-6 sm:mb-8"
          style={{ color: 'var(--text-secondary)' }}
          variants={heroItemVariants}
        >
          <span className="relative inline-block">
            {/* Ghost elements — invisible, absolutely stacked; size the container */}
            {['Data Analyst', 'AI Agent Developer', 'Digital Marketer'].map((t) => (
              <span
                key={t}
                className="invisible select-none block h-0 overflow-hidden"
                aria-hidden="true"
              >
                {t}
              </span>
            ))}
            {/* Live animated text */}
            <span className="absolute inset-x-0 top-0 flex items-center justify-center">
              <TypewriterText
                texts={['Data Analyst', 'AI Agent Developer', 'Digital Marketer']}
                typingSpeed={100}
                deleteSpeed={50}
                delay={2000}
                className="gradient-text"
              />
            </span>
          </span>
        </motion.div>

        {/* CTA Buttons — Von Restorff: Only "View My Work" is filled */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 w-full max-w-xs sm:max-w-none"
          variants={containerVariants}
        >
          {/* PRIMARY CTA — filled accent button */}
          <motion.a
            href="#projects"
            className="btn-primary px-8 py-4 text-base font-bold rounded-xl w-full sm:w-auto text-center shadow-glow-sm hover:shadow-glow-md"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Work
          </motion.a>

          {/* Ghost CTA */}
          <motion.a
            href="/blog"
            className="btn-ghost px-8 py-4 text-base font-bold rounded-xl w-full sm:w-auto text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Read Blog
          </motion.a>

          {/* Ghost CTA */}
          <motion.a
            href="#contact"
            className="btn-ghost px-8 py-4 text-base font-bold rounded-xl w-full sm:w-auto text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Me
          </motion.a>
        </motion.div>

        {/* Social icon links — aria-label added for accessibility (#3) */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-w-full px-2"
          variants={containerVariants}
        >
          {[
            { href: "https://github.com/zahidhasantonmoy", label: "GitHub profile", icon: FaGithub, size: 30 },
            { href: "https://www.linkedin.com/in/zahidhasantonmoy/", label: "LinkedIn profile", icon: FaLinkedin, size: 30 },
            { href: "https://www.facebook.com/zahidhasantonmoybd", label: "Facebook profile", icon: FaFacebook, size: 30 },
            { href: "https://x.com/zahidhasan_bd", label: "Twitter / X profile", icon: FaTwitter, size: 30 },
            { href: "https://medium.com/@zahidhasantonmoy", label: "Medium profile", icon: FaMedium, size: 30 },
            { href: "https://dev.to/zahidhasantonmoy", label: "Dev.to profile", icon: FaDev, size: 30 },
            { href: "https://buymeacoffee.com/zahidhasantonmoy", label: "Buy Me a Coffee", icon: FaCoffee, size: 28 },
          ].map(({ href, label, icon: Icon, size }) => (
            <motion.a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors duration-300"
              style={{ color: 'var(--text-secondary)' }}
              variants={iconVariants}
              whileHover="hover"
              whileTap={{ scale: 0.9 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={size} aria-hidden="true" />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;