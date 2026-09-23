import React from "react";
import Link from "next/link";
import { FaLanguage, FaRocket, FaArrowRight } from "react-icons/fa";
import type { CaseStudy } from "@/types/case-study";
import CaseStudyCard from "./CaseStudyCard";

interface CaseStudyListProps {
  caseStudies: CaseStudy[];
  lang: "en" | "bn";
}

export default function CaseStudyList({ caseStudies, lang }: CaseStudyListProps) {
  const isBn = lang === "bn";

  const t = {
    badge: isBn
      ? "প্রোডাকশন-গ্রেড আর্কিটেকচার ও কেস স্টাডি"
      : "Production-Grade Engineering & Case Studies",
    titleA: isBn ? "বাস্তব কাজের" : "Selected",
    titleB: isBn ? "কেস স্টাডি সমূহ" : "Work & Case Studies",
    desc: isBn
      ? "বাস্তব সমস্যা সমাধান, কারিগরি চ্যালেঞ্জ, স্থাপত্য সিদ্ধান্ত এবং পরিমাপযোগ্য ফলাফলের বিস্তারিত বিশ্লেষণ। কোনো জেনেরিক মার্কেটিং নয় — শুধু খাঁটি প্রকৌশল।"
      : "Detailed architectural breakdowns of real-world solutions, technical bottlenecks, system trade-offs, and measurable impact. No marketing fluff — pure engineering.",
    switchText: isBn ? "View in English" : "বাংলায় দেখুন",
    switchHref: isBn ? "/work" : "/bn/work",
    ctaH2: isBn
      ? "আপনার পরবর্তী প্রজেক্টের জন্য আর্কিটেকচার তৈরি করতে চান?"
      : "Need an Architect for Your Next Big Project?",
    ctaDesc: isBn
      ? "ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন থেকে শুরু করে কাস্টম এআই এজেন্ট ইন্টিগ্রেশন — আপনার লক্ষ্য পূরণে প্রস্তুত।"
      : "From full-stack web applications to autonomous AI workflows — available for freelance, contract, and technical consulting.",
    ctaBtn: isBn ? "সার্ভিসেস ও হায়ার মি" : "Explore Services & Hire Me",
    servicesHref: isBn ? "/bn/services" : "/services",
  };

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* ── Header ── */}
      <section className="relative px-4 sm:px-6 max-w-5xl mx-auto text-center mb-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[130px] opacity-15"
            style={{ background: "var(--accent-primary)" }}
          />
        </div>

        <div className="relative z-10">
          <Link
            href={t.switchHref}
            id="work-lang-switch"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all mb-5 shadow-sm border hover:border-blue-500"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <FaLanguage className="text-sm" /> {t.switchText}
          </Link>

          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm border"
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 0.3)",
              color: "var(--accent-primary)",
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
            {t.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ color: "var(--text-primary)" }}>
            {t.titleA}{" "}
            <span className="gradient-text">
              {t.titleB}
            </span>
          </h1>

          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            {t.desc}
          </p>
        </div>
      </section>

      {/* ── Case Studies Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-20">
        {caseStudies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((cs) => (
              <CaseStudyCard key={cs.slug} caseStudy={cs} lang={lang} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-3xl border p-8"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {isBn
                ? "নতুন কেস স্টাডি প্রস্তুত হচ্ছে..."
                : "New case studies are currently being documented..."}
            </p>
          </div>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div
          className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-12 shadow-xl backdrop-blur-sm text-center border"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 gradient-text">
            {t.ctaH2}
          </h2>
          <p className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8" style={{ color: "var(--text-secondary)" }}>
            {t.ctaDesc}
          </p>
          <Link
            href={t.servicesHref}
            id="work-bottom-services-cta"
            className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base group"
          >
            <FaRocket className="text-sm" />
            <span>{t.ctaBtn}</span>
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </main>
  );
}
