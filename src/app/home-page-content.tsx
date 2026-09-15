import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import ScrollProgress from '@/components/ScrollProgress';
import data from '@/data/data.json';
import { FilterProvider } from '@/context/FilterContext';

// Heavy below-the-fold sections loaded lazily to improve initial page speed
const SkillSection = dynamic(() => import('@/components/SkillSection'), { ssr: true });
const Projects = dynamic(() => import('@/components/Projects'), { ssr: true });
const Achievements = dynamic(() => import('@/components/Achievements'), { ssr: true });
const GitHubSection = dynamic(() => import('@/components/GitHubSection'), { ssr: false });
const TimelineSection = dynamic(() => import('@/components/TimelineSection'), { ssr: true });
const ReviewForm = dynamic(() => import('@/components/ReviewForm'), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact'), { ssr: true });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true });

export default function HomePageContent({ dbProjects, dbSkills }: { dbProjects?: any[], dbSkills?: any[] }) {
  // Map DB projects to frontend expected format
  const mappedProjects = (dbProjects && dbProjects.length > 0) ? dbProjects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    images: p.image_url ? [p.image_url] : [],
    githubUrl: p.github_url || "",
    liveUrl: p.live_url || "",
    category: "Full Stack", // Fallback since DB doesn't have category
    technologies: p.tech_stack || []
  })) : data.projects;

  // Group DB skills by category
  let mappedSkills = data.skills;
  if (dbSkills && dbSkills.length > 0) {
    const categories = Array.from(new Set(dbSkills.map(s => s.category)));
    mappedSkills = categories.map(cat => ({
      category: cat,
      items: dbSkills.filter(s => s.category === cat).map(s => s.name)
    }));
  }

  const finalProjects = mappedProjects;
  const finalSkills = mappedSkills;

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
            <SkillSection skills={finalSkills} />
          </div>
        </section>
        <Projects projects={finalProjects} />
        <Achievements />
        <GitHubSection />
        <TimelineSection />
        <ReviewForm />
        <Contact />
        <Footer />
      </main>
    </FilterProvider>
  );
}
