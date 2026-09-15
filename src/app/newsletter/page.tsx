"use client";

import { useState } from "react";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ type: "success", message: data.message });
        setEmail("");
        setName("");
      } else {
        setResult({ type: "error", message: data.error || "Something went wrong." });
      }
    } catch {
      setResult({ type: "error", message: "Failed to subscribe. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-3xl mb-6">
          📬
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Stay in the Loop
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
          Get notified when I publish new articles about Laravel, React, PostgreSQL,
          and my development journey.
        </p>

        {/* What you&apos;ll get */}
        <ul className="text-left space-y-3 mb-8 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          {[
            "📝 New technical blog posts (English & বাংলা)",
            "📓 Weekly dev journal highlights",
            "🔧 Laravel, React & PostgreSQL tutorials",
            "🚫 No spam, unsubscribe anytime",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="mt-0.5">{item.split(" ")[0]}</span>
              <span>{item.slice(item.indexOf(" ") + 1)}</span>
            </li>
          ))}
        </ul>

        {/* Form */}
        {result?.type === "success" ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-lg">
              {result.message}
            </p>
            <p className="text-emerald-600 dark:text-emerald-500 text-sm mt-2">
              I&apos;ll notify you when the next article drops!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-600 transition text-sm"
            />
            <div className="flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-600 transition text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-xl transition text-sm whitespace-nowrap"
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </div>

            {result?.type === "error" && (
              <p className="text-red-500 text-sm">{result.message}</p>
            )}

            <p className="text-xs text-gray-400">
              No spam, ever. Unsubscribe with one click anytime.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
