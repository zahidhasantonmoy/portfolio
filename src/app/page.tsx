import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Achievements from '@/components/Achievements';
import SkillTreeSection from '@/components/SkillTreeSection';
import GitHubSection from '@/components/GitHubSection';
import TimelineSection from '@/components/TimelineSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Hero />
      <About />
      <SkillTreeSection />
      <Projects />
      <GitHubSection />
      <TimelineSection />
      <Achievements />
      <Contact />
    </main>
  );
}
