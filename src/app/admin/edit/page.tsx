"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SkillCategory {
  category: string;
  items: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl: string;
  liveUrl: string;
}

interface PortfolioData {
  name: string;
  title: string;
  aboutMe: string;
  skills: SkillCategory[];
  projects: Project[];
}

export default function AdminEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (status === "authenticated") {
        try {
          const res = await fetch("/api/content");
          if (!res.ok) {
            throw new Error(`Error fetching data: ${res.statusText}`);
          }
          const data = await res.json();
          setPortfolioData(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPortfolioData();
  }, [status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      return { ...prevData, [name]: value };
    });
  };

  const handleSkillCategoryChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      const newSkills = [...prevData.skills];
      newSkills[index] = { ...newSkills[index], [name]: value };
      return { ...prevData, skills: newSkills };
    });
  };

  const handleSkillItemChange = (
    categoryIndex: number,
    itemIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      const newSkills = [...prevData.skills];
      newSkills[categoryIndex].items[itemIndex] = value;
      return { ...prevData, skills: newSkills };
    });
  };

  const addSkillCategory = () => {
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        skills: [...prevData.skills, { category: "New Category", items: [""] }],
      };
    });
  };

  const addSkillItem = (categoryIndex: number) => {
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      const newSkills = [...prevData.skills];
      newSkills[categoryIndex].items.push("");
      return { ...prevData, skills: newSkills };
    });
  };

  const removeSkillCategory = (index: number) => {
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      const newSkills = prevData.skills.filter((_, i) => i !== index);
      return { ...prevData, skills: newSkills };
    });
  };

  const removeSkillItem = (categoryIndex: number, itemIndex: number) => {
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      const newSkills = [...prevData.skills];
      newSkills[categoryIndex].items = newSkills[categoryIndex].items.filter(
        (_, i) => i !== itemIndex
      );
      return { ...prevData, skills: newSkills };
    });
  };

  const handleProjectChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      const newProjects = [...prevData.projects];
      newProjects[index] = { ...newProjects[index], [name]: value };
      return { ...prevData, projects: newProjects };
    });
  };

  const addProject = () => {
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        projects: [
          ...prevData.projects,
          {
            id: Date.now().toString(), // Simple unique ID
            title: "New Project",
            description: "",
            imageUrl: "",
            githubUrl: "",
            liveUrl: "",
          },
        ],
      };
    });
  };

  const removeProject = (index: number) => {
    setPortfolioData((prevData) => {
      if (!prevData) return null;
      const newProjects = prevData.projects.filter((_, i) => i !== index);
      return { ...prevData, projects: newProjects };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!portfolioData) return;

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolioData),
      });

      if (!res.ok) {
        throw new Error(`Error updating data: ${res.statusText}`);
      }

      setMessage("Portfolio data updated successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-8 text-4xl font-bold">Edit Portfolio Content</h1>

      {message && <div className="mb-4 text-green-500">{message}</div>}
      {error && <div className="mb-4 text-red-500">Error: {error}</div>}

      {portfolioData && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold">Basic Information</h2>
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block text-sm font-bold">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={portfolioData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="title" className="mb-2 block text-sm font-bold">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={portfolioData.title}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="aboutMe" className="mb-2 block text-sm font-bold">
                About Me
              </label>
              <textarea
                id="aboutMe"
                name="aboutMe"
                value={portfolioData.aboutMe}
                onChange={handleChange}
                rows={6}
                className="w-full rounded-md border border-gray-700 bg-gray-700 p-2 text-white"
              ></textarea>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold">Skills</h2>
            {portfolioData.skills.map((skillCategory, categoryIndex) => (
              <div key={categoryIndex} className="mb-6 rounded-md bg-gray-700 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <label
                    htmlFor={`skillCategory-${categoryIndex}`}
                    className="mb-2 block text-sm font-bold"
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    id={`skillCategory-${categoryIndex}`}
                    name="category"
                    value={skillCategory.category}
                    onChange={(e) => handleSkillCategoryChange(categoryIndex, e)}
                    className="w-2/3 rounded-md border border-gray-600 bg-gray-600 p-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkillCategory(categoryIndex)}
                    className="ml-4 rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                  >
                    Remove Category
                  </button>
                </div>
                <h3 className="mb-2 text-lg font-medium">Items:</h3>
                {skillCategory.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="mb-2 flex items-center">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) =>
                        handleSkillItemChange(categoryIndex, itemIndex, e)
                      }
                      className="w-full rounded-md border border-gray-600 bg-gray-600 p-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkillItem(categoryIndex, itemIndex)}
                      className="ml-2 rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSkillItem(categoryIndex)}
                  className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                  Add Skill Item
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSkillCategory}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Add Skill Category
            </button>
          </div>

          {/* Projects */}
          <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold">Projects</h2>
            {portfolioData.projects.map((project, index) => (
              <div key={index} className="mb-6 rounded-md bg-gray-700 p-4">
                <div className="mb-4">
                  <label
                    htmlFor={`projectTitle-${index}`}
                    className="mb-2 block text-sm font-bold"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id={`projectTitle-${index}`}
                    name="title"
                    value={project.title}
                    onChange={(e) => handleProjectChange(index, e)}
                    className="w-full rounded-md border border-gray-600 bg-gray-600 p-2 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor={`projectDescription-${index}`}
                    className="mb-2 block text-sm font-bold"
                  >
                    Description
                  </label>
                  <textarea
                    id={`projectDescription-${index}`}
                    name="description"
                    value={project.description}
                    onChange={(e) => handleProjectChange(index, e)}
                    rows={3}
                    className="w-full rounded-md border border-gray-600 bg-gray-600 p-2 text-white"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor={`projectImageUrl-${index}`}
                    className="mb-2 block text-sm font-bold"
                  >
                    Image URL
                  </label>
                  <input
                    type="text"
                    id={`projectImageUrl-${index}`}
                    name="imageUrl"
                    value={project.imageUrl}
                    onChange={(e) => handleProjectChange(index, e)}
                    className="w-full rounded-md border border-gray-600 bg-gray-600 p-2 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor={`projectGithubUrl-${index}`}
                    className="mb-2 block text-sm font-bold"
                  >
                    GitHub URL
                  </label>
                  <input
                    type="text"
                    id={`projectGithubUrl-${index}`}
                    name="githubUrl"
                    value={project.githubUrl}
                    onChange={(e) => handleProjectChange(index, e)}
                    className="w-full rounded-md border border-gray-600 bg-gray-600 p-2 text-white"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor={`projectLiveUrl-${index}`}
                    className="mb-2 block text-sm font-bold"
                  >
                    Live URL
                  </label>
                  <input
                    type="text"
                    id={`projectLiveUrl-${index}`}
                    name="liveUrl"
                    value={project.liveUrl}
                    onChange={(e) => handleProjectChange(index, e)}
                    className="w-full rounded-md border border-gray-600 bg-gray-600 p-2 text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Remove Project
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addProject}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Add Project
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-3 text-xl font-bold text-white hover:bg-blue-700"
          >
            Save All Changes
          </button>
        </form>
      )}
    </div>
  );
}
