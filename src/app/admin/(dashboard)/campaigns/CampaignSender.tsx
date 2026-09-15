"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function CampaignSender({ activeSubscribersCount }: { activeSubscribersCount: number }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and Body are required.");
      return;
    }

    if (activeSubscribersCount === 0) {
      toast.error("No active subscribers to send to.");
      return;
    }

    const confirmSend = window.confirm(`Are you sure you want to send this to ${activeSubscribersCount} subscribers?`);
    if (!confirmSend) return;

    setSending(true);
    const loadingToast = toast.loading("Sending campaign...");

    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send campaign");

      toast.success(`Successfully sent to ${data.sentCount} subscribers!`);
      setSubject("");
      setBody("");
      
      // Refresh the page to show the new campaign in history
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      toast.dismiss(loadingToast);
      setSending(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Compose Newsletter</h2>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="New tutorial available!"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Message (HTML supported)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="<p>Hello! Check out my latest blog post...</p>"
            rows={8}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={sending || activeSubscribersCount === 0}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {sending ? "Sending..." : `Send to ${activeSubscribersCount} Subscribers`}
        </button>
      </form>
    </div>
  );
}
