"use client";

import React, { useState } from "react";
import { FaPaperPlane, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import type { Lang } from "./servicesData";

interface FormLabels {
  formName: string;
  formEmail: string;
  formMsg: string;
  formBtn: string;
  formSent: string;
  formErr: string;
}

export default function MiniContactForm({
  lang,
  tx,
}: {
  lang: Lang;
  tx: FormLabels;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
      toast.success(tx.formSent);
    } catch {
      toast.error(tx.formErr);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <FaCheck className="text-emerald-400 text-xl" />
        </div>
        <p className="font-bold text-gray-900 dark:text-white">{tx.formSent}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
            {tx.formName}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={lang === "bn" ? "আপনার নাম" : "Your Name"}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
            {tx.formEmail}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          {tx.formMsg}
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={tx.formMsg}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>
      <button
        type="submit"
        id="services-mini-form-submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <FaPaperPlane className={loading ? "animate-bounce" : ""} />
        {loading ? "..." : tx.formBtn}
      </button>
    </form>
  );
}
