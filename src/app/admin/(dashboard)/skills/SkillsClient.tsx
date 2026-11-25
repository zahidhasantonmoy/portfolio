"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Skill = {
  id: string;
  category: "frontend" | "backend" | "tools";
  name: string;
  icon: string;
  proficiency: number;
  display_order: number;
};

export default function SkillsClient({ initialSkills }: { initialSkills: Skill[] }) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Partial<Skill>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = currentSkill.id ? `/api/admin/skills/${currentSkill.id}` : `/api/admin/skills`;
      const method = currentSkill.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentSkill),
      });

      if (!res.ok) throw new Error("Failed to save skill");
      
      const { skill } = await res.json();
      
      if (method === "POST") {
        setSkills([...skills, skill]);
        toast.success("Skill created successfully!");
      } else {
        setSkills(skills.map((s) => (s.id === skill.id ? skill : s)));
        toast.success("Skill updated successfully!");
      }
      
      setIsEditing(false);
      setCurrentSkill({});
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      return;
    }
    setConfirmingDeleteId(null);

    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete skill");
      
      setSkills(skills.filter((s) => s.id !== id));
      toast.success("Skill deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete skill.");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Skills</h1>
          <p className="text-ink-mute">Manage your technical skills</p>
        </div>
        <button
          onClick={() => {
            setCurrentSkill({ category: "frontend", display_order: 0, proficiency: 80 });
            setIsEditing(true);
          }}
          className="self-start sm:self-auto bg-cyan-deep hover:bg-cyan-deep text-ink px-4 py-2 rounded-lg font-medium transition active:scale-95"
        >
          + Add Skill
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-card border border-line-soft p-6 rounded-xl mb-8 space-y-4">
          <h2 className="text-xl font-bold text-ink mb-4">
            {currentSkill.id ? "Edit Skill" : "New Skill"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-mute mb-1">Name</label>
              <input required type="text" value={currentSkill.name || ""} onChange={e => setCurrentSkill({...currentSkill, name: e.target.value})} className="w-full bg-card2 border border-line rounded-lg px-4 py-2 text-ink focus:border-cyan focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-ink-mute mb-1">Category</label>
              <select required value={currentSkill.category || "frontend"} onChange={e => setCurrentSkill({...currentSkill, category: e.target.value as any})} className="w-full bg-card2 border border-line rounded-lg px-4 py-2 text-ink focus:border-cyan focus:outline-none">
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="tools">Tools & Others</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-ink-mute mb-1">Icon (react-icon name or URL)</label>
              <input type="text" value={currentSkill.icon || ""} onChange={e => setCurrentSkill({...currentSkill, icon: e.target.value})} className="w-full bg-card2 border border-line rounded-lg px-4 py-2 text-ink focus:border-cyan focus:outline-none" />
              {currentSkill.icon?.startsWith("http") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentSkill.icon} alt="Icon preview" className="mt-2 h-8 w-8 object-contain" />
              )}
            </div>
            <div>
              <label className="block text-sm text-ink-mute mb-1">Proficiency (1-100)</label>
              <input type="number" min="1" max="100" value={currentSkill.proficiency || 80} onChange={e => setCurrentSkill({...currentSkill, proficiency: Number(e.target.value)})} className="w-full bg-card2 border border-line rounded-lg px-4 py-2 text-ink focus:border-cyan focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-ink-mute mb-1">Display Order</label>
              <input type="number" value={currentSkill.display_order || 0} onChange={e => setCurrentSkill({...currentSkill, display_order: Number(e.target.value)})} className="w-full bg-card2 border border-line rounded-lg px-4 py-2 text-ink focus:border-cyan focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-line-soft">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-ink-mute hover:text-ink transition">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-cyan-deep hover:bg-cyan-deep text-ink rounded-lg transition">
              {isSaving ? "Saving..." : "Save Skill"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["frontend", "backend", "tools"].map(category => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-ink-soft capitalize border-b border-line-soft pb-2">{category}</h3>
            {skills.filter(s => s.category === category).sort((a, b) => a.display_order - b.display_order).map(skill => (
              <div key={skill.id} className="bg-card border border-line-soft p-4 rounded-xl flex items-center justify-between group">
                <div>
                  <p className="font-bold text-ink">{skill.name}</p>
                  <p className="text-xs text-ink-mute">Proficiency: {skill.proficiency}% | Order: {skill.display_order}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setCurrentSkill(skill); setIsEditing(true); }} className="text-cyan hover:text-cyan text-sm">Edit</button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    onBlur={() => {
                      window.setTimeout(() => setConfirmingDeleteId(null), 2500);
                    }}
                    className={
                      confirmingDeleteId === skill.id
                        ? "text-rose-300 bg-rose-500/15 border border-rose-500/40 px-2 py-0.5 rounded-lg text-sm font-medium"
                        : "text-red-400 hover:text-red-300 text-sm"
                    }
                  >
                    {confirmingDeleteId === skill.id ? "Confirm delete?" : "Del"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {skills.length === 0 && (
          <div className="col-span-full text-center py-12 text-ink-mute bg-card/50 rounded-xl border border-dashed border-line-soft">
            No skills found. Add your first skill!
          </div>
        )}
      </div>
    </div>
  );
}
