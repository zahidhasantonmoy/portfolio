"use client";

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Achievements from '@/components/Achievements';
import SkillTree from '@/components/SkillTree';
import GitHubSection from '@/components/GitHubSection';
import TimelineSection from '@/components/TimelineSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Hero />
      <About />
      <SkillTree />
      <Projects />
      <GitHubSection />
      <TimelineSection />
      <Achievements />
      <Contact />
      <Footer />
    </main>
  );
}
