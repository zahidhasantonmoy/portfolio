"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaRocket, FaRobot, FaPlug, FaComments,
  FaArrowRight, FaCheckCircle, FaEnvelope,
  FaGithub, FaLinkedin, FaPaperPlane, FaCheck,
  FaLanguage,
} from "react-icons/fa";
import { SiNextdotjs, SiReact, SiNodedotjs, SiPostgresql, SiTypescript, SiPython } from "react-icons/si";
import toast from "react-hot-toast";

type Lang = "en" | "bn";

const FULL_SAME_AS = [
  "https://github.com/zahidhasantonmoy",
  "https://www.linkedin.com/in/zahidhasantonmoy/",
  "https://www.facebook.com/zahidhasantonmoybd",
  "https://x.com/zahidhasan_bd",
  "https://medium.com/@zahidhasantonmoy",
  "https://dev.to/zahidhasantonmoy",
  "https://buymeacoffee.com/zahidhasantonmoy",
  "https://t.me/zahidhasan_bd",
];

const servicesBilingual = [
  { icon: FaRocket, iconColor: "text-indigo-400", borderColor: "border-indigo-500/20", hoverBorder: "hover:border-indigo-500/50",
    en: { title: "Full-Stack Web MVP", subtitle: "Next.js · React · Node.js · PostgreSQL", description: "From idea to deployed product. I build production-ready full-stack web applications with clean architecture, fast performance, and SEO built-in from day one.", deliverables: ["Responsive UI with Next.js App Router", "REST / GraphQL API (Node.js + Express)", "PostgreSQL / Supabase / MongoDB database", "Auth, Payments, and 3rd-party API integration", "Vercel / Railway deployment + CI/CD"] },
    bn: { title: "ফুল-স্ট্যাক ওয়েব MVP", subtitle: "Next.js · React · Node.js · PostgreSQL", description: "আইডিয়া থেকে deployed প্রোডাক্ট পর্যন্ত। Clean architecture, দ্রুত performance এবং প্রথম দিন থেকেই SEO সহ production-ready ওয়েব অ্যাপ তৈরি করি।", deliverables: ["Next.js App Router দিয়ে Responsive UI", "REST / GraphQL API (Node.js + Express)", "PostgreSQL / Supabase / MongoDB database", "Auth, Payment ও 3rd-party API integration", "Vercel / Railway deployment + CI/CD"] },
  },
  { icon: FaRobot, iconColor: "text-purple-400", borderColor: "border-purple-500/20", hoverBorder: "hover:border-purple-500/50",
    en: { title: "AI Agent Development", subtitle: "LLM · Tool Calling · RAG · Streaming", description: "Custom autonomous AI agents that think, plan, and act. I integrate LLMs into your product with streaming UI, tool calling, RAG pipelines, and robust fallback logic.", deliverables: ["Custom AI agents (Gemini / GPT / Groq)", "RAG pipelines with vector search", "Streaming real-time UI (SSE / WebSocket)", "AI workflow automation & scheduling", "Multi-provider fallback for 99.9% uptime"] },
    bn: { title: "এআই এজেন্ট ডেভেলপমেন্ট", subtitle: "LLM · Tool Calling · RAG · Streaming", description: "Custom autonomous AI agent যা চিন্তা করে, পরিকল্পনা করে এবং কাজ করে। Streaming UI, tool calling, RAG pipeline সহ LLM আপনার প্রোডাক্টে integrate করি।", deliverables: ["Custom AI agent (Gemini / GPT / Groq)", "Vector search সহ RAG pipeline", "Real-time Streaming UI (SSE / WebSocket)", "AI workflow automation ও scheduling", "Multi-provider fallback — 99.9% uptime"] },
  },
  { icon: FaPlug, iconColor: "text-cyan-400", borderColor: "border-cyan-500/20", hoverBorder: "hover:border-cyan-500/50",
    en: { title: "API & Automation", subtitle: "REST · Webhooks · Cron Jobs · Integrations", description: "Connect your existing tools, automate repetitive workflows, and build reliable data pipelines. No more manual busywork.", deliverables: ["REST API design & development", "Webhook integrations (Stripe, Resend, Telegram, etc.)", "Scheduled jobs & cron automation", "Data scraping, parsing & transformation", "Third-party SaaS API integration"] },
    bn: { title: "API ও অটোমেশন", subtitle: "REST · Webhooks · Cron Jobs · Integrations", description: "বিদ্যমান টুলগুলো connect করুন, repetitive workflow automate করুন এবং reliable data pipeline তৈরি করুন।", deliverables: ["REST API design ও development", "Webhook integration (Stripe, Resend, Telegram ইত্যাদি)", "Scheduled job ও cron automation", "Data scraping, parsing ও transformation", "Third-party SaaS API integration"] },
  },
  { icon: FaComments, iconColor: "text-emerald-400", borderColor: "border-emerald-500/20", hoverBorder: "hover:border-emerald-500/50",
    en: { title: "Technical Consulting", subtitle: "Architecture · Code Review · SEO · Performance", description: "Need a second pair of expert eyes? I audit your codebase, optimize performance, fix SEO issues, and advise on architecture decisions.", deliverables: ["Architecture review & recommendations", "Core Web Vitals & performance audit", "SEO + GEO (AI crawler optimization) audit", "Code review & refactoring guidance", "Tech stack selection & roadmap planning"] },
    bn: { title: "টেকনিক্যাল কনসালটিং", subtitle: "Architecture · Code Review · SEO · Performance", description: "বিশেষজ্ঞ দ্বিতীয় মতামত দরকার? Codebase audit, performance optimize, SEO fix এবং architecture decision-এ পরামর্শ দিই।", deliverables: ["Architecture review ও recommendations", "Core Web Vitals ও performance audit", "SEO + GEO (AI crawler) audit", "Code review ও refactoring guidance", "Tech stack selection ও roadmap planning"] },
  },
];

const processBilingual = [
  { step: "01", en: { title: "Discovery Call", desc: "We talk about your goals, timeline, and budget before writing a single line of code." }, bn: { title: "Discovery Call", desc: "লক্ষ্য, সময়সীমা ও বাজেট নিয়ে কথা বলি। একটি লাইন কোড লেখার আগেই সব বুঝে নিই।" } },
  { step: "02", en: { title: "Proposal & Scope", desc: "Clear written proposal: scope, deliverables, timeline, and pricing. No hidden fees." }, bn: { title: "Proposal ও Scope", desc: "Scope, deliverable, timeline ও মূল্য সহ স্পষ্ট written proposal। কোনো লুকানো চার্জ নেই।" } },
  { step: "03", en: { title: "Build & Iterate", desc: "Development starts with regular updates, staging previews, and fast feedback loops." }, bn: { title: "Build ও Iterate", desc: "Development শুরু — নিয়মিত update, staging preview ও দ্রুত feedback loop।" } },
  { step: "04", en: { title: "Launch & Handoff", desc: "Deployment, documentation, and knowledge transfer so your team can maintain everything." }, bn: { title: "Launch ও Handoff", desc: "Deployment, documentation ও knowledge transfer — আপনার team সব maintain করতে পারবে।" } },
];

const techStack = [
  { icon: SiNextdotjs, label: "Next.js" }, { icon: SiReact, label: "React" },
  { icon: SiNodedotjs, label: "Node.js" }, { icon: SiPostgresql, label: "PostgreSQL" },
  { icon: SiTypescript, label: "TypeScript" }, { icon: SiPython, label: "Python" },
];

const labels = {
  en: {
    badge: "Available for Freelance · Contract · Remote Work",
    h1a: "Let's Build Something", h1b: "Exceptional",
    heroDesc: "I'm Zahid — a Full-Stack Developer & AI Engineer based in Dhaka, Bangladesh. I help founders, startups, and engineering teams turn complex ideas into fast, scalable, production-ready products.",
    ctaPrimary: "Get in Touch", ctaProjects: "View My Projects",
    servicesH2: "What I Can Build for You", servicesDesc: "Each engagement is tailored to your specific needs — no cookie-cutter templates.",
    processH2: "How We Work Together", processDesc: "A simple, transparent process — no surprises, no guesswork.",
    pricingH2: "Pricing", pricingDesc: "Every project is different. I provide a clear, itemized quote after a short discovery call — no hidden fees.",
    pricingTiers: [
      { label: "Project-Based", desc: "Fixed scope, fixed price. Best for MVPs and defined deliverables." },
      { label: "Hourly / Retainer", desc: "Flexible engagement for ongoing work, audits, or consulting." },
      { label: "Equity / Part-Time", desc: "Open to early-stage startup partnerships on a case-by-case basis." },
    ],
    pricingBtn: "Contact for Pricing",
    formH2: "Send a Message", formDesc: "Describe your project and I'll reply within 24 hours.",
    formName: "Your Name", formEmail: "Your Email", formMsg: "Tell me about your project...",
    formBtn: "Send Message", formSent: "Message sent! I'll get back to you within 24 hours.",
    formErr: "Failed to send. Please try again or email me directly.",
    emailLabel: "Or email directly:", bannerH2: "Ready to Start a Project?",
    bannerDesc: "Send me a message describing your project and I'll get back to you within 24 hours.",
    switchLang: "বাংলায় দেখুন",
  },
  bn: {
    badge: "ফ্রিল্যান্স · কনট্রাক্ট · রিমোট ওয়ার্কের জন্য উন্মুক্ত",
    h1a: "একসাথে বানাই কিছু", h1b: "অসাধারণ",
    heroDesc: "আমি জাহিদ — ঢাকা, বাংলাদেশ থেকে একজন ফুল-স্ট্যাক ডেভেলপার ও এআই ইঞ্জিনিয়ার। ফাউন্ডার, স্টার্টআপ ও ইঞ্জিনিয়ারিং টিমদের জন্য দ্রুত, স্কেলেবল ও প্রোডাকশন-রেডি প্রোডাক্ট তৈরি করি।",
    ctaPrimary: "যোগাযোগ করুন", ctaProjects: "প্রজেক্ট দেখুন",
    servicesH2: "আমি কী তৈরি করতে পারি", servicesDesc: "প্রতিটি কাজ আপনার নির্দিষ্ট চাহিদা অনুযায়ী — কোনো ছাঁচে ঢালা template নেই।",
    processH2: "কীভাবে একসাথে কাজ করব", processDesc: "সহজ, স্বচ্ছ process — কোনো চমক নেই, কোনো অনিশ্চয়তা নেই।",
    pricingH2: "মূল্য নির্ধারণ", pricingDesc: "প্রতিটি প্রজেক্টের scope ও জটিলতা আলাদা। একটি সংক্ষিপ্ত discovery call-এর পর স্পষ্ট quote দেওয়া হয় — কোনো লুকানো চার্জ নেই।",
    pricingTiers: [
      { label: "প্রজেক্ট-ভিত্তিক", desc: "নির্দিষ্ট scope, নির্দিষ্ট মূল্য। MVP ও সু-নির্ধারিত deliverable-এর জন্য সেরা।" },
      { label: "ঘণ্টা / Retainer", desc: "চলমান কাজ, audit বা consulting-এর জন্য নমনীয় engagement।" },
      { label: "Equity / পার্ট-টাইম", desc: "আর্লি-স্টেজ স্টার্টআপ partnership-এ আগ্রহী — case-by-case ভিত্তিতে।" },
    ],
    pricingBtn: "মূল্য জানতে যোগাযোগ করুন",
    formH2: "বার্তা পাঠান", formDesc: "আপনার প্রজেক্ট সম্পর্কে লিখুন — ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
    formName: "আপনার নাম", formEmail: "আপনার ইমেইল", formMsg: "আপনার প্রজেক্ট সম্পর্কে বলুন...",
    formBtn: "বার্তা পাঠান", formSent: "বার্তা পাঠানো হয়েছে! ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
    formErr: "পাঠানো যায়নি। আবার চেষ্টা করুন বা সরাসরি ইমেইল করুন।",
    emailLabel: "অথবা সরাসরি ইমেইল করুন:", bannerH2: "প্রজেক্ট শুরু করতে প্রস্তুত?",
    bannerDesc: "আপনার প্রজেক্টের বিস্তারিত লিখে পাঠান — ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
    switchLang: "View in English",
  },
} as const;

function MiniContactForm({ lang, tx }: { lang: Lang; tx: typeof labels[Lang] }) {
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
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{tx.formName}</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Zahid Hasan" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{tx.formEmail}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{tx.formMsg}</label>
        <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={tx.formMsg} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none" />
      </div>
      <button type="submit" id="services-mini-form-submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all">
        <FaPaperPlane className={loading ? "animate-bounce" : ""} />
        {loading ? "..." : tx.formBtn}
      </button>
    </form>
  );
}

export default function ServicesClient() {
  const [lang, setLang] = useState<Lang>("en");
  const tx = labels[lang];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://zahidhasantonmoy.vercel.app/services#service",
    name: "Zahid Hasan Tonmoy — Full Stack & AI Development Services",
    url: "https://zahidhasantonmoy.vercel.app/services",
    description: "Full-stack web development, AI agent development, API integration, and technical consulting. Available for freelance, contract, and remote work worldwide.",
    telephone: "+8801850077786",
    email: "zahidhasantonmoy.dev@gmail.com",
    provider: {
      "@type": "Person",
      "@id": "https://zahidhasantonmoy.vercel.app/#person",
      name: "Zahid Hasan Tonmoy",
      url: "https://zahidhasantonmoy.vercel.app",
      jobTitle: "MERN Full Stack Developer & AI Agent Developer",
      address: { "@type": "PostalAddress", streetAddress: "Mirpur", addressLocality: "Dhaka", addressRegion: "Dhaka Division", postalCode: "1216", addressCountry: "BD" },
      sameAs: FULL_SAME_AS,
    },
    areaServed: "Worldwide",
    availableLanguage: ["English", "Bengali"],
    hasOfferCatalog: {
      "@type": "OfferCatalog", name: "Development Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full-Stack Web MVP Development" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Agent Development" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "API & Automation Development" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technical Consulting" } },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
            <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} id="lang-switch-btn" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all mb-5 shadow-sm">
              <FaLanguage className="text-sm" /> {tx.switchLang}
            </button>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-6 shadow-sm">
              <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
              {tx.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              {tx.h1a}{" "}<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{tx.h1b}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">{tx.heroDesc}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {techStack.map(({ icon: Icon, label }) => (<span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm"><Icon className="text-sm" />{label}</span>))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#contact-form" id="hire-me-primary-cta" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all group">
                <FaEnvelope className="text-sm" /><span>{tx.ctaPrimary}</span><FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </a>
              <Link href="/#projects" id="view-projects-btn" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-800 dark:text-gray-200 font-semibold text-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all shadow-sm">{tx.ctaProjects}</Link>
            </div>
          </div>
        </section>

        {/* ── Services Grid ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{tx.servicesH2}</h2><p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">{tx.servicesDesc}</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servicesBilingual.map((svc) => {
              const Icon = svc.icon; const d = svc[lang];
              return (<article key={d.title} className={`relative rounded-3xl border ${svc.borderColor} ${svc.hoverBorder} bg-white dark:bg-gray-900/60 p-8 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-sm`}>
                <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300"><Icon className={`text-xl ${svc.iconColor}`} /></div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{d.title}</h3>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-4 font-mono">{d.subtitle}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">{d.description}</p>
                <ul className="space-y-2">{d.deliverables.map((item) => (<li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><FaCheckCircle className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5 text-xs" /><span>{item}</span></li>))}</ul>
              </article>);
            })}
          </div>
        </section>

        {/* ── Process ── */}
        <section className="bg-white dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{tx.processH2}</h2><p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">{tx.processDesc}</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {processBilingual.map((step) => { const d = step[lang]; return (<div key={step.step} className="text-center"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20"><span className="text-white font-extrabold text-lg">{step.step}</span></div><h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{d.title}</h3><p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{d.desc}</p></div>); })}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">{tx.pricingH2}</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">{tx.pricingDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {tx.pricingTiers.map((tier) => (<div key={tier.label} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 text-left shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"><p className="font-bold text-gray-900 dark:text-white text-sm mb-2">{tier.label}</p><p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tier.desc}</p></div>))}
          </div>
          <a href="#contact-form" id="pricing-contact-cta" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all group"><FaEnvelope className="text-sm" /><span>{tx.pricingBtn}</span><FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" /></a>
        </section>

        {/* ── Embedded Contact Form ── */}
        <section id="contact-form" className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
          <div className="rounded-3xl border border-indigo-200/60 dark:border-indigo-900/50 bg-white dark:bg-gray-900/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
            <div className="mb-6"><h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{tx.formH2}</h2><p className="text-sm text-gray-500 dark:text-gray-400">{tx.formDesc}</p></div>
            <MiniContactForm lang={lang} tx={tx} />
            <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">{tx.emailLabel}{" "}<a href="mailto:zahidhasantonmoy.dev@gmail.com" id="mailto-fallback" className="text-indigo-500 hover:underline font-medium">zahidhasantonmoy.dev@gmail.com</a></p>
          </div>
        </section>

        {/* ── Bottom Banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 py-16 px-4">
          <div className="pointer-events-none absolute inset-0"><div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" /><div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" /></div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">{tx.bannerH2}</h2>
            <p className="text-indigo-200 text-base leading-relaxed mb-8">{tx.bannerDesc}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#contact-form" id="bottom-hire-cta" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg"><FaEnvelope />{tx.ctaPrimary}</a>
              <div className="flex items-center gap-3">
                <a href="https://github.com/zahidhasantonmoy" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"><FaGithub size={18} /></a>
                <a href="https://www.linkedin.com/in/zahidhasantonmoy/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"><FaLinkedin size={18} /></a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
