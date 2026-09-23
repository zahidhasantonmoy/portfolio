import { FaRocket, FaRobot, FaPlug, FaComments } from "react-icons/fa";
import { SiNextdotjs, SiReact, SiNodedotjs, SiPostgresql, SiTypescript, SiPython } from "react-icons/si";
import type { IconType } from "react-icons";

export type Lang = "en" | "bn";

export const FULL_SAME_AS = [
  "https://github.com/zahidhasantonmoy",
  "https://www.linkedin.com/in/zahidhasantonmoy/",
  "https://www.facebook.com/zahidhasantonmoybd",
  "https://x.com/zahidhasan_bd",
  "https://medium.com/@zahidhasantonmoy",
  "https://dev.to/zahidhasantonmoy",
  "https://buymeacoffee.com/zahidhasantonmoy",
  "https://t.me/zahidhasan_bd",
];

export interface ServiceDetail {
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
}

export interface ServiceItem {
  icon: IconType;
  iconColor: string;
  borderColor: string;
  hoverBorder: string;
  en: ServiceDetail;
  bn: ServiceDetail;
}

export const servicesBilingual: ServiceItem[] = [
  {
    icon: FaRocket,
    iconColor: "text-indigo-400",
    borderColor: "border-indigo-500/20",
    hoverBorder: "hover:border-indigo-500/50",
    en: {
      title: "Full-Stack Web MVP",
      subtitle: "Next.js · React · Node.js · PostgreSQL",
      description:
        "From idea to deployed product. I build production-ready full-stack web applications with clean architecture, fast performance, and SEO built-in from day one.",
      deliverables: [
        "Responsive UI with Next.js App Router",
        "REST / GraphQL API (Node.js + Express)",
        "PostgreSQL / Supabase / MongoDB database",
        "Auth, Payments, and 3rd-party API integration",
        "Vercel / Railway deployment + CI/CD",
      ],
    },
    bn: {
      title: "ফুল-স্ট্যাক ওয়েব MVP",
      subtitle: "Next.js · React · Node.js · PostgreSQL",
      description:
        "আইডিয়া থেকে deployed প্রোডাক্ট পর্যন্ত। Clean architecture, দ্রুত performance এবং প্রথম দিন থেকেই SEO সহ production-ready ওয়েব অ্যাপ তৈরি করি।",
      deliverables: [
        "Next.js App Router দিয়ে Responsive UI",
        "REST / GraphQL API (Node.js + Express)",
        "PostgreSQL / Supabase / MongoDB database",
        "Auth, Payment ও 3rd-party API integration",
        "Vercel / Railway deployment + CI/CD",
      ],
    },
  },
  {
    icon: FaRobot,
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    en: {
      title: "AI Agent Development",
      subtitle: "LLM · Tool Calling · RAG · Streaming",
      description:
        "Custom autonomous AI agents that think, plan, and act. I integrate LLMs into your product with streaming UI, tool calling, RAG pipelines, and robust fallback logic.",
      deliverables: [
        "Custom AI agents (Gemini / GPT / Groq)",
        "RAG pipelines with vector search",
        "Streaming real-time UI (SSE / WebSocket)",
        "AI workflow automation & scheduling",
        "Multi-provider fallback for 99.9% uptime",
      ],
    },
    bn: {
      title: "এআই এজেন্ট ডেভেলপমেন্ট",
      subtitle: "LLM · Tool Calling · RAG · Streaming",
      description:
        "Custom autonomous AI agent যা চিন্তা করে, পরিকল্পনা করে এবং কাজ করে। Streaming UI, tool calling, RAG pipeline সহ LLM আপনার প্রোডাক্টে integrate করি।",
      deliverables: [
        "Custom AI agent (Gemini / GPT / Groq)",
        "Vector search সহ RAG pipeline",
        "Real-time Streaming UI (SSE / WebSocket)",
        "AI workflow automation ও scheduling",
        "Multi-provider fallback — 99.9% uptime",
      ],
    },
  },
  {
    icon: FaPlug,
    iconColor: "text-cyan-400",
    borderColor: "border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/50",
    en: {
      title: "API & Automation",
      subtitle: "REST · Webhooks · Cron Jobs · Integrations",
      description:
        "Connect your existing tools, automate repetitive workflows, and build reliable data pipelines. No more manual busywork.",
      deliverables: [
        "REST API design & development",
        "Webhook integrations (Stripe, Resend, Telegram, etc.)",
        "Scheduled jobs & cron automation",
        "Data scraping, parsing & transformation",
        "Third-party SaaS API integration",
      ],
    },
    bn: {
      title: "API ও অটোমেশন",
      subtitle: "REST · Webhooks · Cron Jobs · Integrations",
      description:
        "বিদ্যমান টুলগুলো connect করুন, repetitive workflow automate করুন এবং reliable data pipeline তৈরি করুন।",
      deliverables: [
        "REST API design ও development",
        "Webhook integration (Stripe, Resend, Telegram ইত্যাদি)",
        "Scheduled job ও cron automation",
        "Data scraping, parsing ও transformation",
        "Third-party SaaS API integration",
      ],
    },
  },
  {
    icon: FaComments,
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    en: {
      title: "Technical Consulting",
      subtitle: "Architecture · Code Review · SEO · Performance",
      description:
        "Need a second pair of expert eyes? I audit your codebase, optimize performance, fix SEO issues, and advise on architecture decisions.",
      deliverables: [
        "Architecture review & recommendations",
        "Core Web Vitals & performance audit",
        "SEO + GEO (AI crawler optimization) audit",
        "Code review & refactoring guidance",
        "Tech stack selection & roadmap planning",
      ],
    },
    bn: {
      title: "টেকনিক্যাল কনসালটিং",
      subtitle: "Architecture · Code Review · SEO · Performance",
      description:
        "বিশেষজ্ঞ দ্বিতীয় মতামত দরকার? Codebase audit, performance optimize, SEO fix এবং architecture decision-এ পরামর্শ দিই।",
      deliverables: [
        "Architecture review ও recommendations",
        "Core Web Vitals ও performance audit",
        "SEO + GEO (AI crawler) audit",
        "Code review ও refactoring guidance",
        "Tech stack selection ও roadmap planning",
      ],
    },
  },
];

export const processBilingual = [
  {
    step: "01",
    en: {
      title: "Discovery Call",
      desc: "We talk about your goals, timeline, and budget before writing a single line of code.",
    },
    bn: {
      title: "Discovery Call",
      desc: "লক্ষ্য, সময়সীমা ও বাজেট নিয়ে কথা বলি। একটি লাইন কোড লেখার আগেই সব বুঝে নিই।",
    },
  },
  {
    step: "02",
    en: {
      title: "Proposal & Scope",
      desc: "Clear written proposal: scope, deliverables, timeline, and pricing. No hidden fees.",
    },
    bn: {
      title: "Proposal ও Scope",
      desc: "Scope, deliverable, timeline ও মূল্য সহ স্পষ্ট written proposal। কোনো লুকানো চার্জ নেই।",
    },
  },
  {
    step: "03",
    en: {
      title: "Build & Iterate",
      desc: "Development starts with regular updates, staging previews, and fast feedback loops.",
    },
    bn: {
      title: "Build ও Iterate",
      desc: "Development শুরু — নিয়মিত update, staging preview ও দ্রুত feedback loop।",
    },
  },
  {
    step: "04",
    en: {
      title: "Launch & Handoff",
      desc: "Deployment, documentation, and knowledge transfer so your team can maintain everything.",
    },
    bn: {
      title: "Launch ও Handoff",
      desc: "Deployment, documentation ও knowledge transfer — আপনার team সব maintain করতে পারবে।",
    },
  },
];

export const techStack = [
  { icon: SiNextdotjs, label: "Next.js" },
  { icon: SiReact, label: "React" },
  { icon: SiNodedotjs, label: "Node.js" },
  { icon: SiPostgresql, label: "PostgreSQL" },
  { icon: SiTypescript, label: "TypeScript" },
  { icon: SiPython, label: "Python" },
];

export const labels = {
  en: {
    badge: "Available for Freelance · Contract · Remote Work",
    h1a: "Let's Build Something",
    h1b: "Exceptional",
    heroDesc:
      "I'm Zahid — a Full-Stack Developer & AI Engineer based in Dhaka, Bangladesh. I help founders, startups, and engineering teams turn complex ideas into fast, scalable, production-ready products.",
    ctaPrimary: "Get in Touch",
    ctaProjects: "View My Projects",
    servicesH2: "What I Can Build for You",
    servicesDesc: "Each engagement is tailored to your specific needs — no cookie-cutter templates.",
    processH2: "How We Work Together",
    processDesc: "A simple, transparent process — no surprises, no guesswork.",
    pricingH2: "Pricing",
    pricingDesc:
      "Every project is different. I provide a clear, itemized quote after a short discovery call — no hidden fees.",
    pricingTiers: [
      { label: "Project-Based", desc: "Fixed scope, fixed price. Best for MVPs and defined deliverables." },
      { label: "Hourly / Retainer", desc: "Flexible engagement for ongoing work, audits, or consulting." },
      { label: "Equity / Part-Time", desc: "Open to early-stage startup partnerships on a case-by-case basis." },
    ],
    pricingBtn: "Contact for Pricing",
    formH2: "Send a Message",
    formDesc: "Describe your project and I'll reply within 24 hours.",
    formName: "Your Name",
    formEmail: "Your Email",
    formMsg: "Tell me about your project...",
    formBtn: "Send Message",
    formSent: "Message sent! I'll get back to you within 24 hours.",
    formErr: "Failed to send. Please try again or email me directly.",
    emailLabel: "Or email directly:",
    bannerH2: "Ready to Start a Project?",
    bannerDesc: "Send me a message describing your project and I'll get back to you within 24 hours.",
    switchLang: "বাংলায় দেখুন",
    switchHref: "/bn/services",
  },
  bn: {
    badge: "ফ্রিল্যান্স · কনট্রাক্ট · রিমোট ওয়ার্কের জন্য উন্মুক্ত",
    h1a: "একসাথে বানাই কিছু",
    h1b: "অসাধারণ",
    heroDesc:
      "আমি জাহিদ — ঢাকা, বাংলাদেশ থেকে একজন ফুল-স্ট্যাক ডেভেলপার ও এআই ইঞ্জিনিয়ার। ফাউন্ডার, স্টার্টআপ ও ইঞ্জিনিয়ারিং টিমদের জন্য দ্রুত, স্কেলেবল ও প্রোডাকশন-রেডি প্রোডাক্ট তৈরি করি।",
    ctaPrimary: "যোগাযোগ করুন",
    ctaProjects: "প্রজেক্ট দেখুন",
    servicesH2: "আমি কী তৈরি করতে পারি",
    servicesDesc: "প্রতিটি কাজ আপনার নির্দিষ্ট চাহিদা অনুযায়ী — কোনো ছাঁচে ঢালা template নেই।",
    processH2: "কীভাবে একসাথে কাজ করব",
    processDesc: "সহজ, স্বচ্ছ process — কোনো চমক নেই, কোনো অনিশ্চয়তা নেই।",
    pricingH2: "মূল্য নির্ধারণ",
    pricingDesc:
      "প্রতিটি প্রজেক্টের scope ও জটিলতা আলাদা। একটি সংক্ষিপ্ত discovery call-এর পর স্পষ্ট quote দেওয়া হয় — কোনো লুকানো চার্জ নেই।",
    pricingTiers: [
      { label: "প্রজেক্ট-ভিত্তিক", desc: "নির্দিষ্ট scope, নির্দিষ্ট মূল্য। MVP ও সু-নির্ধারিত deliverable-এর জন্য সেরা।" },
      { label: "ঘণ্টা / Retainer", desc: "চলমান কাজ, audit বা consulting-এর জন্য নমনীয় engagement।" },
      { label: "Equity / পার্ট-টাইম", desc: "আর্লি-স্টেজ স্টার্টআপ partnership-এ আগ্রহী — case-by-case ভিত্তিতে।" },
    ],
    pricingBtn: "মূল্য জানতে যোগাযোগ করুন",
    formH2: "বার্তা পাঠান",
    formDesc: "আপনার প্রজেক্ট সম্পর্কে লিখুন — ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
    formName: "আপনার নাম",
    formEmail: "আপনার ইমেইল",
    formMsg: "আপনার প্রজেক্ট সম্পর্কে বলুন...",
    formBtn: "বার্তা পাঠান",
    formSent: "বার্তা পাঠানো হয়েছে! ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
    formErr: "পাঠানো যায়নি। আবার চেষ্টা করুন বা সরাসরি ইমেইল করুন।",
    emailLabel: "অথবা সরাসরি ইমেইল করুন:",
    bannerH2: "প্রজেক্ট শুরু করতে প্রস্তুত?",
    bannerDesc: "আপনার প্রজেক্টের বিস্তারিত লিখে পাঠান — ২৪ ঘণ্টার মধ্যে উত্তর পাবেন।",
    switchLang: "View in English",
    switchHref: "/services",
  },
} as const;
