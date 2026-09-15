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
    if (!confirm("Are you sure you want to delete this skill?")) return;
    
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-gray-400">Manage your technical skills</p>
        </div>
        <button
          onClick={() => {
            setCurrentSkill({ category: "frontend", display_order: 0, proficiency: 80 });
            setIsEditing(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Add Skill
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 p-6 rounded-xl mb-8 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentSkill.id ? "Edit Skill" : "New Skill"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input required type="text" value={currentSkill.name || ""} onChange={e => setCurrentSkill({...currentSkill, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select required value={currentSkill.category || "frontend"} onChange={e => setCurrentSkill({...currentSkill, category: e.target.value as any})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none">
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="tools">Tools & Others</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Icon (react-icon name or URL)</label>
              <input type="text" value={currentSkill.icon || ""} onChange={e => setCurrentSkill({...currentSkill, icon: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Proficiency (1-100)</label>
              <input type="number" min="1" max="100" value={currentSkill.proficiency || 80} onChange={e => setCurrentSkill({...currentSkill, proficiency: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Display Order</label>
              <input type="number" value={currentSkill.display_order || 0} onChange={e => setCurrentSkill({...currentSkill, display_order: Number(e.target.value)})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
              {isSaving ? "Saving..." : "Save Skill"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["frontend", "backend", "tools"].map(category => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-300 capitalize border-b border-gray-800 pb-2">{category}</h3>
            {skills.filter(s => s.category === category).sort((a, b) => a.display_order - b.display_order).map(skill => (
              <div key={skill.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between group">
                <div>
                  <p className="font-bold text-white">{skill.name}</p>
                  <p className="text-xs text-gray-500">Proficiency: {skill.proficiency}% | Order: {skill.display_order}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setCurrentSkill(skill); setIsEditing(true); }} className="text-indigo-400 hover:text-indigo-300 text-sm">Edit</button>
                  <button onClick={() => handleDelete(skill.id)} className="text-red-400 hover:text-red-300 text-sm">Del</button>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {skills.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
            No skills found. Add your first skill!
          </div>
        )}
      </div>
    </div>
  );
}
