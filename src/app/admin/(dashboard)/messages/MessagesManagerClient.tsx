'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaEnvelope,
  FaWhatsapp,
  FaCheck,
  FaTrash,
  FaSearch,
  FaFilter,
  FaUserCheck,
  FaPaperPlane,
} from 'react-icons/fa';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | string;
  created_at: string;
}

interface MessagesManagerClientProps {
  initialMessages: ContactMessage[];
  onMarkRead: (id: string) => Promise<void>;
  onMarkUnread: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type CrmStage = 'new' | 'in_discussion' | 'proposal_sent' | 'hired' | 'archived';

const STAGE_CONFIG: Record<CrmStage, { label: string; badge: string; icon: string }> = {
  new: { label: 'New Inquiry', badge: 'bg-cyan/20 text-cyan border-cyan/30', icon: '📥' },
  in_discussion: { label: 'In Discussion', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: '💬' },
  proposal_sent: { label: 'Proposal Sent', badge: 'bg-cyan/20 text-cyan border-cyan/30', icon: '📄' },
  hired: { label: 'Hired / Closed', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '🏆' },
  archived: { label: 'Archived', badge: 'bg-card2/40 text-ink-mute border-line', icon: '📦' },
};

export default function MessagesManagerClient({
  initialMessages,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: MessagesManagerClientProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [crmStages, setCrmStages] = useState<Record<string, CrmStage>>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [phoneInputFor, setPhoneInputFor] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");

  // Load CRM stages from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_crm_stages');
      if (saved) {
        setCrmStages(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const getStageForMessage = (msg: ContactMessage): CrmStage => {
    if (crmStages[msg.id]) return crmStages[msg.id];
    if (msg.status === 'unread') return 'new';
    if (msg.status === 'replied') return 'proposal_sent';
    return 'in_discussion';
  };

  const updateStage = (id: string, stage: CrmStage) => {
    const updated = { ...crmStages, [id]: stage };
    setCrmStages(updated);
    try {
      localStorage.setItem('admin_crm_stages', JSON.stringify(updated));
    } catch {}

    if (stage === 'new') {
      onMarkUnread(id);
    } else {
      onMarkRead(id);
    }
    toast.success(`Updated stage to ${STAGE_CONFIG[stage].label}`);
  };

  const handleDelete = async (id: string) => {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      return;
    }
    setConfirmingDeleteId(null);
    setIsDeleting(id);
    try {
      await onDelete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success('Message deleted');
    } catch {
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(null);
    }
  };

  // WhatsApp helper — the phone number is guessed from the message body
  // (first 10–14 digit run); when none is found, ask for it inline in the
  // card instead of a prompt() dialog.
  const handleWhatsAppReply = (msg: ContactMessage, manualPhone?: string) => {
    const phoneMatch = msg.message.match(/(\+?\d{10,14})/);
    const phone = manualPhone
      ? manualPhone.replace(/[^\d]/g, '')
      : phoneMatch
        ? phoneMatch[0].replace(/[^\d+]/g, '')
        : '';
    const text = encodeURIComponent(
      `Hi ${msg.name}, thank you for reaching out through my portfolio (zahidhasantonmoy.vercel.app)! Regarding your message: "${msg.message.slice(0, 60)}..." — I'd love to connect.`
    );

    if (phone) {
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      setPhoneInputFor(null);
      setPhoneInput('');
    } else {
      setPhoneInputFor(msg.id);
      setPhoneInput('');
    }
  };

  // Email helper with pre-written templates
  const handleEmailReply = (msg: ContactMessage, templateType: 'welcome' | 'meeting' | 'proposal') => {
    let subject = `Re: Inquiry from ${msg.name} - Zahid Hasan Tonmoy`;
    let body = '';

    if (templateType === 'welcome') {
      body = `Hi ${msg.name},\n\nThank you for reaching out through my portfolio website!\n\nI reviewed your note regarding:\n"${msg.message}"\n\nI would be glad to help. Could you share a few more details about your timeline and expectations?\n\nBest regards,\nZahid Hasan Tonmoy\nMERN Full Stack Developer & AI Agent Developer\nhttps://zahidhasantonmoy.vercel.app`;
    } else if (templateType === 'meeting') {
      body = `Hi ${msg.name},\n\nThanks for your message! This sounds like an interesting project.\n\nAre you available for a quick 15-minute call or Google Meet this week to align on the technical requirements and project scope?\n\nLooking forward to speaking with you.\n\nBest,\nZahid Hasan Tonmoy`;
    } else {
      body = `Hi ${msg.name},\n\nFollowing up on your inquiry, I have prepared a proposal tailored to your requirements.\n\nYou can review my past work and engineering benchmarks here: https://zahidhasantonmoy.vercel.app\n\nLet me know if you have any questions!\n\nBest regards,\nZahid Hasan Tonmoy`;
    }

    const mailto = `mailto:${msg.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    updateStage(msg.id, 'in_discussion');
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const stage = getStageForMessage(msg);
    if (selectedStage !== 'all' && stage !== selectedStage) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = msg.name.toLowerCase().includes(q);
      const matchEmail = msg.email.toLowerCase().includes(q);
      const matchMsg = msg.message.toLowerCase().includes(q);
      return matchName || matchEmail || matchMsg;
    }
    return true;
  });

  // Calculate counts for pipeline
  const counts: Record<string, number> = { all: messages.length };
  (Object.keys(STAGE_CONFIG) as CrmStage[]).forEach((s) => {
    counts[s] = messages.filter((m) => getStageForMessage(m) === s).length;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <span>💼 Client Lead Pipeline & CRM</span>
          </h1>
          <p className="text-ink-mute text-sm mt-1">
            Track inquiries, manage proposal stages, and reply with 1 click.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, keywords..."
            className="w-full bg-card border border-line-soft rounded-xl pl-9 pr-4 py-2 text-ink text-xs focus:outline-none focus:border-cyan"
          />
        </div>
      </div>

      {/* Pipeline Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedStage('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            selectedStage === 'all'
              ? 'bg-cyan-deep text-ink shadow-sm'
              : 'bg-card border border-line-soft text-ink-mute hover:text-ink'
          }`}
        >
          <span>All Messages</span>
          <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">{counts.all}</span>
        </button>

        {(Object.entries(STAGE_CONFIG) as [CrmStage, (typeof STAGE_CONFIG)[CrmStage]][]).map(([stageKey, config]) => (
          <button
            key={stageKey}
            onClick={() => setSelectedStage(stageKey)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedStage === stageKey
                ? 'bg-card2 border-cyan text-ink shadow-sm'
                : 'bg-card/80 border-line-soft text-ink-mute hover:text-ink'
            }`}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">{counts[stageKey] || 0}</span>
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16 bg-card/60 border border-line-soft rounded-2xl">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-ink-soft font-semibold text-sm">No messages found in this stage.</p>
            <p className="text-ink-mute text-xs mt-1">Try selecting a different filter or clearing search.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const currentStage = getStageForMessage(msg);
            const stageInfo = STAGE_CONFIG[currentStage] || STAGE_CONFIG.new;

            return (
              <div
                key={msg.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  currentStage === 'new'
                    ? 'bg-card/90 border-cyan/40'
                    : currentStage === 'hired'
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-card/60 border-line-soft'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <h3 className="text-base font-bold text-ink">{msg.name}</h3>

                      {/* Stage Selector Dropdown */}
                      <select
                        value={currentStage}
                        onChange={(e) => updateStage(msg.id, e.target.value as CrmStage)}
                        aria-label="Update CRM pipeline stage"
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none bg-bg ${stageInfo.badge}`}
                      >
                        <option value="new">📥 New Inquiry</option>
                        <option value="in_discussion">💬 In Discussion</option>
                        <option value="proposal_sent">📄 Proposal Sent</option>
                        <option value="hired">🏆 Hired / Closed</option>
                        <option value="archived">📦 Archived</option>
                      </select>
                    </div>

                    <a
                      href={`mailto:${msg.email}`}
                      className="text-cyan hover:text-cyan text-xs font-mono flex items-center gap-1.5 transition"
                    >
                      <FaEnvelope className="w-3 h-3 opacity-80" />
                      <span>{msg.email}</span>
                    </a>
                  </div>

                  <div className="text-xs text-ink-mute font-medium whitespace-nowrap self-start sm:self-auto">
                    {new Date(msg.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-bg/70 p-4 rounded-xl text-ink-soft text-xs sm:text-sm whitespace-pre-wrap break-words border border-line-soft/80 leading-relaxed font-sans">
                  {msg.message}
                </div>

                {/* Bottom Action Toolbar */}
                <div className="mt-4 pt-3.5 border-t border-line-soft/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* WhatsApp Button */}
                    <button
                      type="button"
                      onClick={() => handleWhatsAppReply(msg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition active:scale-95"
                    >
                      <FaWhatsapp className="text-sm" />
                      <span>WhatsApp Reply</span>
                    </button>

                    {phoneInputFor === msg.id && (
                      <span className="flex items-center gap-1.5">
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="WhatsApp no. e.g. 8801700000000"
                          aria-label="Client WhatsApp number"
                          className="w-44 bg-bg border border-line rounded-lg px-2.5 py-1.5 text-xs text-ink placeholder-ink-mute focus:outline-none focus:border-cyan"
                        />
                        <button
                          type="button"
                          onClick={() => handleWhatsAppReply(msg, phoneInput)}
                          disabled={!phoneInput.trim()}
                          className="px-2.5 py-1.5 bg-cyan-deep text-ink rounded-lg text-xs font-semibold transition disabled:opacity-50"
                        >
                          Open WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhoneInputFor(null)}
                          aria-label="Cancel"
                          className="px-2 py-1.5 text-xs text-ink-mute hover:text-ink transition"
                        >
                          ✕
                        </button>
                      </span>
                    )}

                    {/* Quick Email Templates Dropdown */}
                    <div className="relative group">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-deep hover:bg-cyan-deep text-ink rounded-lg text-xs font-semibold transition active:scale-95"
                      >
                        <FaPaperPlane className="text-xs" />
                        <span>Open email draft ▾</span>
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-card border border-line rounded-xl shadow-sm p-1.5 w-60 z-20 space-y-1">
                        <button
                          type="button"
                          onClick={() => handleEmailReply(msg, 'welcome')}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-ink-soft hover:bg-cyan-deep hover:text-ink transition"
                        >
                          👋 Welcome & Acknowledge
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEmailReply(msg, 'meeting')}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-ink-soft hover:bg-cyan-deep hover:text-ink transition"
                        >
                          📅 Request 15-min Scope Call
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEmailReply(msg, 'proposal')}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-ink-soft hover:bg-cyan-deep hover:text-ink transition"
                        >
                          📄 Portfolio & Pricing draft
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mark / Delete Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        currentStage === 'new'
                          ? updateStage(msg.id, 'in_discussion')
                          : updateStage(msg.id, 'new')
                      }
                      className="px-2.5 py-1.5 text-xs text-ink-mute hover:text-ink bg-card2/80 hover:bg-card2 rounded-lg transition"
                    >
                      {currentStage === 'new' ? 'Mark Read' : 'Mark Unread'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(msg.id)}
                      onBlur={() => {
                        // Give the second click a chance to land before resetting.
                        window.setTimeout(() => setConfirmingDeleteId(null), 2500);
                      }}
                      disabled={isDeleting === msg.id}
                      className={
                        confirmingDeleteId === msg.id
                          ? "px-2.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/15 border border-rose-500/40 rounded-lg transition disabled:opacity-50"
                          : "p-2 text-xs text-ink-mute hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                      }
                      title={confirmingDeleteId === msg.id ? "Click again to confirm deleting this message" : "Delete Message"}
                    >
                      {confirmingDeleteId === msg.id
                        ? isDeleting === msg.id
                          ? "Deleting…"
                          : "Confirm delete?"
                        : <FaTrash className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
