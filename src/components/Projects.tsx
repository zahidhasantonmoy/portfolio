"use client";
import React from 'react';
import ProjectCard from './ProjectCard';

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  githubUrl: string;
  liveUrl: string;
  category: string;
  technologies?: string[];
}

interface ProjectsProps {
  projects: Project[];
}

type FilterKey = 'all' | 'web' | 'data' | 'app';

const FILTERS: { key: FilterKey; label: (count: number) => string }[] = [
  { key: 'all', label: (n) => `All ${n} projects` },
  { key: 'web', label: (n) => `Websites & shops (${n})` },
  { key: 'data', label: (n) => `Data & AI (${n})` },
  { key: 'app', label: (n) => `Apps & devices (${n})` },
];

/** R4 filter bucket, from the project's DB category first, tech stack as fallback. */
function filterKeyFor(project: Project): Exclude<FilterKey, 'all'> {
  const category = (project.category || '').toLowerCase();
  if (category === 'ai/ml' || category === 'ai' || category === 'data') return 'data';
  if (category === 'mobile app' || category === 'iot' || category === 'app') return 'app';
  const hay = `${project.category || ''} ${(project.technologies || []).join(' ')} ${project.title}`.toLowerCase();
  if (/flutter|mobile|android|ios|iot|esp32|micropython|drainage|sensor/.test(hay)) return 'app';
  if (/machine learning|scikit|pandas|predict|regression|\bai\/ml\b/.test(hay)) return 'data';
  return 'web';
}

const Projects = ({ projects }: ProjectsProps) => {
  const [filter, setFilter] = React.useState<FilterKey>('all');

  const counts: Record<FilterKey, number> = {
    all: projects.length,
    web: projects.filter((p) => filterKeyFor(p) === 'web').length,
    data: projects.filter((p) => filterKeyFor(p) === 'data').length,
    app: projects.filter((p) => filterKeyFor(p) === 'app').length,
  };

  const visibleProjects =
    filter === 'all' ? projects : projects.filter((p) => filterKeyFor(p) === filter);

  return (
    <section id="work" className="wrap pb-1.5 pt-16">
      <div className="sec-head">
        <span className="sec-tag">01 · Selected work</span>
        <h2>My work — problem, build, result</h2>
        <p>
          For every project: <strong>what the problem was, what I built, and what happened</strong>. No
          invented numbers — where I have no user figures to show, I say so. Use the buttons to filter by
          kind.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-[9px]" role="group" aria-label="Filter projects">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={`min-h-[46px] cursor-pointer rounded-full border-[1.5px] px-[18px] py-2.5 text-[14.5px] font-extrabold transition-colors ${
                active
                  ? 'border-cyan bg-cyan text-[#04121a]'
                  : 'border-line bg-card text-ink-soft hover:border-cyan-deep hover:text-ink'
              }`}
            >
              {label(counts[key])}
            </button>
          );
        })}
      </div>

      {visibleProjects.length === 0 ? (
        <p className="mt-6 text-ink-soft">No projects in this group yet.</p>
      ) : (
        <div className="mt-[22px] grid gap-4 md:grid-cols-2">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              images={project.images}
              technologies={project.technologies || []}
              liveUrl={project.liveUrl}
              githubUrl={project.githubUrl}
              category={project.category}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Projects;
