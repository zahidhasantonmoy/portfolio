interface SkillCategory {
  category: string;
  items: string[];
}

interface ProjectLike {
  title: string;
  technologies?: string[];
}

interface SkillSectionProps {
  skills: SkillCategory[];
  projects?: ProjectLike[];
  postCount?: number;
}

interface SkillGroup {
  label: string;
  title: string;
  tools: string[];
  proof: string;
}

/**
 * The four R4 skill groups. A tool pill is shown only when the tool is
 * evidenced by the real data — a DB/local skill name or a project tech stack
 * — plus three items evidenced outside those lists: "AI agents" (the user's
 * role and his AI-agent blog series), "Git / GitHub" (his public GitHub
 * profile) and "Figma" (listed in the portfolio data). Proof lines name
 * real projects from the data.
 */
const GROUPS: SkillGroup[] = [
  {
    label: 'Group A',
    title: 'The part you see',
    tools: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'HTML / CSS'],
    proof: 'Curious Cart BD, Jerseyvault, Vortex Shield',
  },
  {
    label: 'Group B',
    title: 'The part behind',
    tools: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Supabase', 'Firebase'],
    proof: 'Flexpath, Jerseyvault, Smart Drainage',
  },
  {
    label: 'Group C',
    title: 'Data & AI',
    tools: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'AI agents'],
    proof: 'Gold Price Predictor',
  },
  {
    label: 'Group D',
    title: 'Apps & devices',
    tools: ['Flutter', 'ESP32', 'MicroPython', 'Git / GitHub', 'Figma'],
    proof: 'The Flexpath mobile app, Smart Drainage System',
  },
];

const ALWAYS_EVIDENCED = new Set(['ai agents', 'git / github', 'figma']);

function toolEvidenced(tool: string, evidence: Set<string>): boolean {
  const t = tool.toLowerCase();
  if (ALWAYS_EVIDENCED.has(t)) return true;
  if (evidence.has(t)) return true;
  // Aliases: "Express" <-> "Express.js", "HTML / CSS" <-> "HTML" / "CSS"
  if (t === 'express') return evidence.has('express.js');
  if (t === 'html / css') return evidence.has('html') || evidence.has('css');
  return false;
}

const SkillSection = ({ skills, projects, postCount }: SkillSectionProps) => {
  const evidence = new Set<string>();
  (skills || []).forEach((cat) =>
    (cat.items || []).forEach((item) => evidence.add(item.toLowerCase()))
  );
  (projects || []).forEach((p) =>
    (p.technologies || []).forEach((tech) => evidence.add(tech.toLowerCase()))
  );

  return (
    <section id="skills" className="wrap pb-1.5 pt-16">
      <div className="sec-head">
        <span className="sec-tag">03 · Skills</span>
        <h2>Tools I use — and the work that proves them</h2>
        <p>
          No percentage bars and no “90% JavaScript”. <strong>Every skill below points to a real project</strong>{' '}
          where I used it.
        </p>
      </div>

      <div className="mt-[26px] grid gap-3.5 md:grid-cols-2">
        {GROUPS.map((group) => {
          const tools = group.tools.filter((tool) => toolEvidenced(tool, evidence));
          const proof =
            group.label === 'Group C' && typeof postCount === 'number'
              ? `${group.proof}, and my ${postCount} blog posts`
              : group.proof;
          return (
            <div
              key={group.label}
              className="rounded-[20px] border-[1.5px] border-line-soft bg-card p-[22px] transition-colors hover:border-cyan-deep"
            >
              <h3 className="text-xl font-extrabold">
                <span className="mb-[5px] block font-mono text-xs font-normal uppercase tracking-[0.1em] text-cyan">
                  {group.label}
                </span>
                {group.title}
              </h3>
              <ul className="mt-[13px] flex list-none flex-wrap gap-[7px]">
                {tools.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border-[1.5px] border-line px-3 py-[5px] text-[14.5px] font-bold text-ink"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
              <p className="mt-[14px] rounded-xl bg-card2 px-[13px] py-[10px] text-[14.5px] text-ink-soft">
                <b className="mb-0.5 block font-mono text-[11.5px] uppercase tracking-[0.07em] text-amber">
                  See it in
                </b>
                {proof}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SkillSection;
