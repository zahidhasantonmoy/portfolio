import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import About from '@/components/About';
import ScrollProgress from '@/components/ScrollProgress';
import data from '@/data/data.json';
import { FilterProvider } from '@/context/FilterContext';

// Heavy below-the-fold sections loaded lazily to improve initial page speed & eliminate hydration lag
const SkillSection = dynamic(() => import('@/components/SkillSection'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[350px] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  ),
});
const Projects = dynamic(() => import('@/components/Projects'), { ssr: true });
const Achievements = dynamic(() => import('@/components/Achievements'), { ssr: false });
const GitHubSection = dynamic(() => import('@/components/GitHubSection'), { ssr: false });
const TimelineSection = dynamic(() => import('@/components/TimelineSection'), { ssr: false });
const ReviewForm = dynamic(() => import('@/components/ReviewForm'), { ssr: false });
const Contact = dynamic(() => import('@/components/Contact'), { ssr: true });

export default function HomePageContent({ dbProjects, dbSkills }: { dbProjects?: any[], dbSkills?: any[] }) {
  // Map DB projects to frontend expected format
  const mappedProjects = (dbProjects && dbProjects.length > 0) ? dbProjects.map(p => {
    const matching = data.projects.find((dp: any) => 
      dp.title.toLowerCase() === (p.title || "").toLowerCase() || 
      dp.id === String(p.id)
    );
    const techStack: string[] = p.tech_stack || matching?.technologies || [];
    const techStr = techStack.join(" ").toLowerCase();

    let category = p.category || matching?.category;
    if (!category) {
      if (/flutter|android|react native|mobile|ios/i.test(techStr) || /app|flexpath/i.test(p.title || "")) {
        category = "Mobile App";
      } else if (/python|scikit|pandas|machine learning|deep learning|keras|tensorflow|ai|regression|predict/i.test(techStr)) {
        category = "AI/ML";
      } else if (/iot|esp32|micropython|arduino|sensor|drainage/i.test(techStr)) {
        category = "IoT";
      } else if (/security|encryption|aes|argon|cyber|shield|vault/i.test(techStr)) {
        category = "Cybersecurity";
      } else if (/next\.js|react|mongo|node|express|mern|php|sql|mysql|ecommerce/i.test(techStr)) {
        category = "Web Development";
      } else {
        category = "Full Stack";
      }
    }

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      images: p.image_url ? [p.image_url] : (matching?.images || []),
      githubUrl: p.github_url || matching?.githubUrl || "",
      liveUrl: p.live_url || matching?.liveUrl || "",
      category: category,
      technologies: techStack
    };
  }) : data.projects;

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
      </main>
    </FilterProvider>
  );
}
