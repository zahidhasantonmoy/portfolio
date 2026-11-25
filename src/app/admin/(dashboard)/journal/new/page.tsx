"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { LogMood } from "@/types/blog";

const MOODS: { value: LogMood; emoji: string; label: string }[] = [
  { value: "productive", emoji: "🚀", label: "Productive" },
  { value: "learning", emoji: "📚", label: "Learning" },
  { value: "breakthrough", emoji: "💡", label: "Breakthrough" },
  { value: "stuck", emoji: "😤", label: "Stuck" },
];

export default function NewJournalPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    log_date: today,
    title: `Dev Log — ${new Date().toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}`,
    mood: "productive" as LogMood,
    content_en: "",
    content_bn: "",
    tech_stack: "",
    is_public: true,
  });

  async function handleSave() {
    setSaving(true);

    if (!form.title.trim() || !form.content_en.trim()) {
      toast.error("Title and English content are required.");
      setSaving(false);
      return;
    }

    const tech_stack = form.tech_stack
      ? form.tech_stack.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch("/api/admin/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tech_stack,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Journal entry saved!");
      router.push("/admin/journal");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">New Journal Entry</h1>
        <p className="text-ink-mute text-sm mt-1">Log today&apos;s learning journey 📓</p>
      </div>

      <div className="bg-card border border-line-soft rounded-xl p-6 space-y-5">
        {/* Date + Title */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-2">Date</label>
            <input
              type="date"
              value={form.log_date}
              onChange={(e) => setForm({ ...form, log_date: e.target.value })}
              className="w-full px-3 py-2.5 bg-card2 border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-cyan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-2">Mood</label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setForm({ ...form, mood: m.value })}
                  title={m.label}
                  className={`flex-1 py-2 rounded-lg transition flex flex-col items-center gap-0.5 ${
                    form.mood === m.value
                      ? "bg-cyan-deep ring-2 ring-cyan"
                      : "bg-card2 hover:bg-line"
                  }`}
                >
                  <span className="text-lg leading-none">{m.emoji}</span>
                  <span className="text-[11px] font-medium leading-none">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-card2 border border-line rounded-lg text-ink focus:outline-none focus:border-cyan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            Tech Stack (comma-separated)
          </label>
          <input
            type="text"
            value={form.tech_stack}
            onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
            placeholder="Laravel, PHP, PostgreSQL, React"
            className="w-full px-4 py-3 bg-card2 border border-line rounded-lg text-ink placeholder-ink-mute text-sm focus:outline-none focus:border-cyan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            What did I learn? (English) <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.content_en}
            onChange={(e) => setForm({ ...form, content_en: e.target.value })}
            placeholder="Today I learned about Laravel middleware. I discovered that..."
            rows={8}
            className="w-full px-4 py-3 bg-card2 border border-line rounded-lg text-ink placeholder-ink-mute text-sm focus:outline-none focus:border-cyan resize-y font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-soft mb-2">
            আজ কী শিখলাম? (বাংলা)
          </label>
          <textarea
            value={form.content_bn}
            onChange={(e) => setForm({ ...form, content_bn: e.target.value })}
            placeholder="আজ আমি Laravel middleware সম্পর্কে শিখলাম..."
            rows={5}
            className="w-full px-4 py-3 bg-card2 border border-line rounded-lg text-ink placeholder-ink-mute text-sm focus:outline-none focus:border-cyan resize-y"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_public"
            checked={form.is_public}
            onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
            className="w-4 h-4 accent-cyan"
          />
          <label htmlFor="is_public" className="text-sm text-ink-soft">
            Make this entry public (visible on /journal)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-line-soft">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-ink-mute hover:text-ink-soft transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm bg-cyan-deep hover:bg-cyan-deep text-ink rounded-lg font-medium transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
