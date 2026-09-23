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
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-28 pb-20">
      {/* ── Header ── */}
      <section className="relative px-4 sm:px-6 max-w-5xl mx-auto text-center mb-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
        </div>

        <div className="relative z-10">
          <Link
            href={t.switchHref}
            id="work-lang-switch"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all mb-5 shadow-sm"
          >
            <FaLanguage className="text-sm" /> {t.switchText}
          </Link>

          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            {t.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            {t.titleA}{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.titleB}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
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
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isBn
                ? "নতুন কেস স্টাডি প্রস্তুত হচ্ছে..."
                : "New case studies are currently being documented..."}
            </p>
          </div>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 dark:from-gray-900/90 dark:via-indigo-950/30 dark:to-purple-950/20 p-8 sm:p-12 shadow-xl shadow-indigo-500/5 backdrop-blur-sm text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            {t.ctaH2}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto mb-8">
            {t.ctaDesc}
          </p>
          <Link
            href={t.servicesHref}
            id="work-bottom-services-cta"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all group"
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
