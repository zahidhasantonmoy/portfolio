"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Project = {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  image_url: string;
  display_order: number;
};

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = currentProject.id ? `/api/admin/projects/${currentProject.id}` : `/api/admin/projects`;
      const method = currentProject.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentProject,
          tech_stack: Array.isArray(currentProject.tech_stack) 
            ? currentProject.tech_stack 
            : (currentProject.tech_stack as unknown as string || "").split(",").map((s) => s.trim()).filter(Boolean)
        }),
      });

      if (!res.ok) throw new Error("Failed to save project");
      
      const { project } = await res.json();
      
      if (method === "POST") {
        setProjects([project, ...projects]);
        toast.success("Project created successfully!");
      } else {
        setProjects(projects.map((p) => (p.id === project.id ? project : p)));
        toast.success("Project updated successfully!");
      }
      
      setIsEditing(false);
      setCurrentProject({});
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      
      setProjects(projects.filter((p) => p.id !== id));
      toast.success("Project deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project.");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => {
            setCurrentProject({ display_order: 0 });
            setIsEditing(true);
          }}
          className="self-start sm:self-auto bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition active:scale-95"
        >
          + Add Project
        </button>
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="bg-gray-900 border border-gray-800 p-6 rounded-xl mb-8 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">
            {currentProject.id ? "Edit Project" : "New Project"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input required type="text" value={currentProject.title || ""} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tech Stack (comma separated)</label>
              <input required type="text" value={Array.isArray(currentProject.tech_stack) ? currentProject.tech_stack.join(", ") : (currentProject.tech_stack || "")} onChange={e => setCurrentProject({...currentProject, tech_stack: e.target.value as unknown as string[]})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea required rows={3} value={currentProject.description || ""} onChange={e => setCurrentProject({...currentProject, description: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">GitHub URL</label>
              <input type="url" value={currentProject.github_url || ""} onChange={e => setCurrentProject({...currentProject, github_url: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Live URL</label>
              <input type="url" value={currentProject.live_url || ""} onChange={e => setCurrentProject({...currentProject, live_url: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Image URL</label>
              <input type="url" value={currentProject.image_url || ""} onChange={e => setCurrentProject({...currentProject, image_url: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Display Order (lower is first)</label>
            <input type="number" value={currentProject.display_order || 0} onChange={e => setCurrentProject({...currentProject, display_order: Number(e.target.value)})} className="w-full md:w-1/3 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
              {isSaving ? "Saving..." : "Save Project"}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{project.title}</h3>
                <span className="text-xs text-gray-500">Order: {project.display_order}</span>
              </div>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech_stack?.map(tech => (
                  <span key={tech} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-md">{tech}</span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 justify-end border-t border-gray-800 pt-3">
              <button onClick={() => { setCurrentProject(project); setIsEditing(true); }} className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded transition">Edit</button>
              <button onClick={() => handleDelete(project.id)} className="text-xs px-3 py-1.5 bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded transition">Delete</button>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
            No projects found. Add your first project!
          </div>
        )}
      </div>
    </div>
  );
}
