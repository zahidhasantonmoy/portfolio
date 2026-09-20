"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaTelegramPlane,
  FaDev,
  FaMedium,
  FaTwitter,
  FaFacebook,
  FaCoffee,
  FaEnvelope,
  FaGlobe,
  FaFileAlt,
  FaShareAlt,
  FaCheck,
  FaBookOpen,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa";

interface LinkItem {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isExternal?: boolean;
  badge?: string;
  highlight?: boolean;
  accentColor?: string;
}

const PRIMARY_LINKS: LinkItem[] = [
  {
    id: "telegram",
    title: "Chat on Telegram",
    subtitle: "Direct message for inquiries & fast response",
    url: "https://t.me/zahidhasan_bd",
    icon: FaTelegramPlane,
    isExternal: true,
    badge: "Fastest Reply",
    highlight: true,
    accentColor: "from-sky-500/20 to-blue-600/20 border-sky-500/40 text-sky-400",
  },
  {
    id: "linkedin",
    title: "LinkedIn Profile",
    subtitle: "Professional network, experience & recommendations",
    url: "https://www.linkedin.com/in/zahidhasantonmoy/",
    icon: FaLinkedin,
    isExternal: true,
    badge: "Network",
    accentColor: "from-blue-600/20 to-indigo-600/20 border-blue-500/40 text-blue-400",
  },
  {
    id: "github",
    title: "GitHub Repositories",
    subtitle: "Explore open-source code & active project builds",
    url: "https://github.com/zahidhasantonmoy",
    icon: FaGithub,
    isExternal: true,
    badge: "9+ Live Repos",
    accentColor: "from-purple-600/20 to-pink-600/20 border-purple-500/40 text-purple-400",
  },
  {
    id: "portfolio",
    title: "Main Portfolio Website",
    subtitle: "Interactive 3D showcase, skills & work case studies",
    url: "https://zahidhasantonmoy.vercel.app",
    icon: FaGlobe,
    isExternal: false,
    badge: "Official",
    accentColor: "from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-400",
  },
  {
    id: "resume-hire",
    title: "Request Resume / Hire Me",
    subtitle: "Available for full-time, contract & freelance roles",
    url: "https://zahidhasantonmoy.vercel.app/#contact",
    icon: FaFileAlt,
    isExternal: false,
    badge: "Available 🟢",
    highlight: true,
    accentColor: "from-amber-500/20 to-orange-600/20 border-amber-500/40 text-amber-400",
  },
];

const WRITING_LINKS: LinkItem[] = [
  {
    id: "blog-en",
    title: "Technical Blog (English)",
    subtitle: "Deep-dives into React, Next.js, AI Agents & Architecture",
    url: "https://zahidhasantonmoy.vercel.app/blog",
    icon: FaBookOpen,
    isExternal: false,
    badge: "Tutorials",
    accentColor: "from-indigo-500/20 to-violet-600/20 border-indigo-500/40 text-indigo-400",
  },
  {
    id: "blog-bn",
    title: "বাংলা ব্লগ (Bengali Blog)",
    subtitle: "মাতৃভাষায় প্রোগ্রামিং, ডেটা সায়েন্স ও সফটওয়্যার ইঞ্জিনিয়ারিং",
    url: "https://zahidhasantonmoy.vercel.app/bn/blog",
    icon: FaBookOpen,
    isExternal: false,
    badge: "🇧🇩 বাংলা",
    accentColor: "from-emerald-600/20 to-green-700/20 border-emerald-500/40 text-emerald-400",
  },
  {
    id: "devto",
    title: "DEV.to Community",
    subtitle: "Developer community articles & open-source thoughts",
    url: "https://dev.to/zahidhasantonmoy",
    icon: FaDev,
    isExternal: true,
    accentColor: "from-zinc-500/20 to-zinc-700/20 border-zinc-500/40 text-zinc-300",
  },
  {
    id: "medium",
    title: "Medium Publications",
    subtitle: "In-depth technology articles and guides",
    url: "https://medium.com/@zahidhasantonmoy",
    icon: FaMedium,
    isExternal: true,
    accentColor: "from-neutral-500/20 to-neutral-700/20 border-neutral-500/40 text-neutral-300",
  },
];

const SOCIAL_LINKS: LinkItem[] = [
  {
    id: "twitter",
    title: "X (Twitter)",
    subtitle: "Tech insights, AI updates & software engineering discourse",
    url: "https://x.com/zahidhasan_bd",
    icon: FaTwitter,
    isExternal: true,
    accentColor: "from-slate-500/20 to-slate-700/20 border-slate-500/40 text-slate-300",
  },
  {
    id: "buymeacoffee",
    title: "Buy Me a Coffee",
    subtitle: "Support my open-source tools and technical writing",
    url: "https://buymeacoffee.com/zahidhasantonmoy",
    icon: FaCoffee,
    isExternal: true,
    badge: "Support",
    accentColor: "from-yellow-500/20 to-amber-600/20 border-yellow-500/40 text-yellow-400",
  },
  {
    id: "facebook",
    title: "Facebook Profile",
    subtitle: "Connect on personal & developer social network",
    url: "https://www.facebook.com/zahidhasantonmoybd",
    icon: FaFacebook,
    isExternal: true,
    accentColor: "from-blue-700/20 to-blue-900/20 border-blue-600/40 text-blue-400",
  },
  {
    id: "email",
    title: "Send Direct Email",
    subtitle: "zahidhasantonmoy.dev@gmail.com",
    url: "mailto:zahidhasantonmoy.dev@gmail.com",
    icon: FaEnvelope,
    isExternal: true,
    accentColor: "from-rose-500/20 to-red-600/20 border-rose-500/40 text-rose-400",
  },
];

export default function LinksClient() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareData = {
      title: "Zahid Hasan Tonmoy — Links & Social Hub",
      text: "Connect with Zahid Hasan Tonmoy (MERN Full Stack & AI Agent Developer)",
      url: "https://zahidhasantonmoy.vercel.app/links",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText("https://zahidhasantonmoy.vercel.app/links");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col items-center justify-between relative overflow-hidden px-4 py-12 selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-blue-600/10 blur-[130px] pointer-events-none -z-10" />

      {/* Main Card Container */}
      <main className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Top Action Bar */}
        <div className="w-full flex items-center justify-between mb-8 px-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full transition-all duration-200 backdrop-blur-md"
          >
            <span>←</span>
            <span>Back to Portfolio</span>
          </Link>

          <button
            onClick={handleShare}
            aria-label="Share profile link"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full transition-all duration-200 backdrop-blur-md"
          >
            {copied ? (
              <>
                <FaCheck className="text-emerald-400" />
                <span className="text-emerald-400">Copied Link!</span>
              </>
            ) : (
              <>
                <FaShareAlt className="text-indigo-400" />
                <span>Share Hub</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Avatar with glowing ring and pulsating status */}
          <div className="relative mb-4 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl bg-gray-900">
              <Image
                src="/images/profile.jpg"
                alt="Zahid Hasan Tonmoy"
                width={96}
                height={96}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            {/* Pulsing Live Beacon */}
            <span
              className="absolute bottom-1 right-1 flex h-4 w-4"
              title="Available for freelance & full-time opportunities"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#07090e]" />
            </span>
          </div>

          {/* Name & Badge */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 mb-1">
            <span>Zahid Hasan Tonmoy</span>
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-[11px] shadow-sm"
              title="Verified Developer Profile"
            >
              ✓
            </span>
          </h1>

          {/* Title / Role */}
          <p className="text-sm sm:text-base text-indigo-300/90 font-medium mb-2 max-w-md">
            MERN Full Stack Developer · AI Agent Developer · Data Analyst
          </p>

          {/* Location & University */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 font-medium mb-4">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-rose-400" /> Dhaka, Bangladesh
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaGraduationCap className="text-indigo-400" /> B.Sc in CSE @ BUBT
            </span>
          </div>

          {/* Bio Pill */}
          <p className="text-xs sm:text-sm text-gray-300/80 max-w-md leading-relaxed bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-2.5 backdrop-blur-sm">
            Building scalable full-stack web applications, autonomous AI agents, and intelligent cloud systems. Open for global remote & freelance roles.
          </p>
        </div>

        {/* Quick Highlights / Status Pills */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-base sm:text-lg font-bold text-white">9+</div>
            <div className="text-[10px] sm:text-xs text-gray-400">Projects Built</div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-base sm:text-lg font-bold text-emerald-400">🟢 Open</div>
            <div className="text-[10px] sm:text-xs text-gray-400">For Hire</div>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
            <div className="text-base sm:text-lg font-bold text-indigo-400">Full Stack</div>
            <div className="text-[10px] sm:text-xs text-gray-400">MERN & AI</div>
          </div>
        </div>

        {/* Section: Priority & Direct Connect */}
        <div className="w-full mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Direct Connect & Portfolio</span>
          </h2>
          <div className="space-y-3">
            {PRIMARY_LINKS.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>

        {/* Section: Writing & Technical Content */}
        <div className="w-full mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Technical Articles & Blogs</span>
          </h2>
          <div className="space-y-3">
            {WRITING_LINKS.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>

        {/* Section: Social & Support */}
        <div className="w-full mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <span>Socials & Community</span>
          </h2>
          <div className="space-y-3">
            {SOCIAL_LINKS.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center pt-8 border-t border-white/10 text-xs text-gray-500">
        <p className="mb-2">
          Designed & Built with Next.js & Tailwind CSS by{" "}
          <Link href="/" className="text-gray-300 hover:text-white font-medium transition-colors">
            Zahid Hasan Tonmoy
          </Link>
        </p>
        <p className="text-[11px] text-gray-600">
          © {new Date().getFullYear()} Zahid Hasan Tonmoy. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function LinkCard({ link }: { link: LinkItem }) {
  const Icon = link.icon;
  const isExternal = link.isExternal !== false;

  return (
    <a
      href={link.url}
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
        link.highlight
          ? "bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 border-indigo-500/40 shadow-lg shadow-indigo-950/30 hover:border-indigo-400/80 hover:shadow-indigo-500/20 hover:scale-[1.015]"
          : "bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-white/20 hover:scale-[1.01]"
      } backdrop-blur-md`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${
            link.accentColor || "from-white/10 to-white/5 border-white/10 text-white"
          } border text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-inner`}
        >
          <Icon />
        </div>
        <div className="text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base text-gray-100 group-hover:text-white transition-colors truncate">
              {link.title}
            </span>
            {link.badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 flex-shrink-0">
                {link.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors truncate max-w-[280px] sm:max-w-md">
            {link.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-gray-500 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1 pl-2 flex-shrink-0">
        {isExternal ? (
          <FaExternalLinkAlt className="text-xs opacity-60 group-hover:opacity-100" />
        ) : (
          <FaArrowRight className="text-xs opacity-60 group-hover:opacity-100" />
        )}
      </div>
    </a>
  );
}
