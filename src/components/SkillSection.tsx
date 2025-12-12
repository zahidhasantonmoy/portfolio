'use client';

import SkillsInteractive from './SkillsInteractive';

interface SkillCategory {
  category: string;
  items: string[];
}

interface SkillSectionProps {
  skills: SkillCategory[];
}

const SkillSection = ({ skills }: SkillSectionProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SkillsInteractive skills={skills} />
    </div>
  );
};

export default SkillSection;
