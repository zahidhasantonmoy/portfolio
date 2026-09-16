'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaFileAlt, FaPaperPlane, FaCheckCircle, FaBriefcase, FaBuilding, FaEnvelope, FaUser } from 'react-icons/fa';

export default function ResumeLeadDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    purpose: 'Full-Time Engineering Role',
    message: '',
  });

  useEffect(() => {
    const handleOpen = (e: any) => {
      if (e?.detail?.purpose) {
        setForm((prev) => ({ ...prev, purpose: e.detail.purpose }));
      }
      setSubmitted(false);
      setErrorMessage('');
      setIsOpen(true);
    };

    window.addEventListener('open-resume-drawer', handleOpen);
    return () => window.removeEventListener('open-resume-drawer', handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMessage('Please provide your name and work email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        message: `[REQUEST RESUME & QUICK HIRE LEAD]\n• Company / Organization: ${form.company.trim() || 'Not specified'}\n• Inquiry Purpose: ${form.purpose}\n• Notes / Job Details: ${form.message.trim() || 'Requested full official CV and credentials.'}`,
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8"
          >
            {/* Top Accent Gradient */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {/* Header */}
            <div className="p-6 pb-4 flex items-start justify-between border-b border-gray-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FaFileAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Request Resume & CV
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Direct access for verified recruiters, clients & engineering leaders
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                    <FaCheckCircle className="text-3xl" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-white">Request Dispatched!</h4>
                    <p className="text-sm text-gray-300 max-w-sm mx-auto leading-relaxed">
                      Thank you, <span className="text-indigo-400 font-semibold">{form.name}</span>. Your request has been received. Zahid Hasan Tonmoy has been notified and his full confidential CV and project credentials will be shared with <span className="text-indigo-400 font-semibold">{form.email}</span> shortly.
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="https://wa.me/8801850077786"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                    >
                      💬 WhatsApp Quick Chat
                    </a>
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition border border-gray-700"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <FaUser className="text-gray-500 text-[10px]" />
                      Your Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-300 flex items-center gap-1.5">
                        <FaEnvelope className="text-gray-500 text-[10px]" />
                        Work Email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-300 flex items-center gap-1.5">
                        <FaBuilding className="text-gray-500 text-[10px]" />
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TechCorp / Agency"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <FaBriefcase className="text-gray-500 text-[10px]" />
                      Inquiry Purpose
                    </label>
                    <select
                      value={form.purpose}
                      onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Full-Time Engineering Role">Full-Time Software Engineering Role</option>
                      <option value="Contract / Freelance Project">Contract / Freelance Project (MERN & AI)</option>
                      <option value="AI / Automation Consulting">AI Agent & LLM Automation Consulting</option>
                      <option value="Executive / Recruiter Inquiries">Recruiter Outreach / Talent Pool</option>
                      <option value="Other Collaboration">Other Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-300">
                      Brief Message or Role Description <span className="text-gray-500 text-[11px]">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mention tech stack, role requirements, or project details..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-500 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-500">
                      🔒 Your email is never shared publicly.
                    </span>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-indigo-600/20"
                    >
                      {loading ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <FaPaperPlane className="text-xs" />
                          <span>Request Resume</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
