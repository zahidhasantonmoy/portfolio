import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Achievements from '@/components/Achievements';
import SkillSection from '@/components/SkillSection';
import GitHubSection from '@/components/GitHubSection';
import TimelineSection from '@/components/TimelineSection';
import Footer from '@/components/Footer';

export default async function HomePageContent() {
  let data = {
    name: "Loading...",
    title: "Loading...",
    aboutMe: "Loading...",
    skills: [],
    projects: []
  }; // Default empty data to prevent errors during initial render

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/content`);

    if (!res.ok) {
      console.error(`Failed to fetch data: ${res.status} ${res.statusText}`);
      // Optionally, throw an error or return a fallback UI
      return (
        <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <p className="text-red-500">Error loading portfolio data. Please check the server logs.</p>
        </main>
      );
    }

    data = await res.json();
    console.log("Fetched data:", data);

    // Ensure skills is an array, even if empty
    if (!data.skills || !Array.isArray(data.skills)) {
      console.warn("Skills data is missing or not an array. Using empty array.");
      data.skills = [];
    }
    // Ensure projects is an array, even if empty
    if (!data.projects || !Array.isArray(data.projects)) {
      console.warn("Projects data is missing or not an array. Using empty array.");
      data.projects = [];
    }

  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-500">Error loading portfolio data. Please check the server logs.</p>
      </main>
    );
  }

  return (
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
      <Contact />
      <Footer />
    </main>
  );
}