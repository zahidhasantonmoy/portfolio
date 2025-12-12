import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Achievements from '@/components/Achievements';
import SkillSection from '@/components/SkillSection';
import GitHubSection from '@/components/GitHubSection';
import TimelineSection from '@/components/TimelineSection';
import ReviewForm from '@/components/ReviewForm';
import Footer from '@/components/Footer';
import data from '@/data/data.json';
import { FilterProvider } from '@/context/FilterContext';
import ScrollProgress from '@/components/ScrollProgress';

export default async function HomePageContent() {
  // Data is now imported directly, no need for a fetch call. (Touched)

  return (
    <FilterProvider>
      <ScrollProgress />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <Hero name={data.name} title={data.title} />
        <About aboutMe={data.aboutMe} />
        <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">My Skills</h2>
            <SkillSection skills={data.skills} />
          </div>
        </section>
        <Projects projects={data.projects} />
        <GitHubSection />
        <TimelineSection />
        <Achievements />
        <ReviewForm />
        <Contact />
        <Footer />
      </main>
    </FilterProvider>
  );
}