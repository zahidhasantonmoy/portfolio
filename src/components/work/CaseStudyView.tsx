import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaExternalLinkAlt,
  FaGithub,
  FaLanguage,
  FaArrowLeft,
  FaCheckCircle,
  FaLightbulb,
  FaExclamationTriangle,
  FaRocket,
} from "react-icons/fa";
import type { CaseStudy } from "@/types/case-study";
import ArticleContent from "@/components/blog/ArticleContent";

interface CaseStudyViewProps {
  caseStudy: CaseStudy;
  lang: "en" | "bn";
}

export default function CaseStudyView({ caseStudy, lang }: CaseStudyViewProps) {
  const isBn = lang === "bn";
  const content = isBn ? caseStudy.bangla : caseStudy.english;
  const seo = caseStudy.seo;
  const switchHref = isBn
    ? `/work/${caseStudy.slug}`
    : `/bn/work/${caseStudy.slug}`;
  const backHref = isBn ? "/bn/work" : "/work";
  const servicesHref = isBn
    ? "/bn/services#contact-form"
    : "/services#contact-form";

  const currentUrl = isBn
    ? `https://zahidhasantonmoy.vercel.app/bn/work/${caseStudy.slug}`
    : `https://zahidhasantonmoy.vercel.app/work/${caseStudy.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["CreativeWork", "Article"],
    "@id": `${currentUrl}#casestudy`,
    headline: content.title,
    name: `${caseStudy.project_name} — Case Study`,
    description: isBn ? seo.meta_description_bn : seo.meta_description_en,
    inLanguage: isBn ? "bn" : "en",
    url: currentUrl,
    datePublished: caseStudy.published_date,
    dateModified: caseStudy.updated_date,
    author: {
      "@type": "Person",
      "@id": "https://zahidhasantonmoy.vercel.app/#person",
      name: "Zahid Hasan Tonmoy",
      url: "https://zahidhasantonmoy.vercel.app",
    },
    publisher: {
      "@type": "Person",
      "@id": "https://zahidhasantonmoy.vercel.app/#person",
      name: "Zahid Hasan Tonmoy",
    },
    keywords: caseStudy.tags.join(", "),
    mainEntityOfPage: currentUrl,
    image: caseStudy.thumbnail?.src
      ? `https://zahidhasantonmoy.vercel.app${caseStudy.thumbnail.src}`
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-28 pb-20">
        {/* ── Breadcrumb & Top Bar ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8 flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            <span>{isBn ? "সকল কেস স্টাডি" : "All Case Studies"}</span>
          </Link>

          <Link
            href={switchHref}
            id="casestudy-lang-switch"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm"
          >
            <FaLanguage className="text-sm" />
            <span>{isBn ? "View in English" : "বাংলায় দেখুন"}</span>
          </Link>
        </div>

        {/* ── Hero Section ── */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {caseStudy.category.toUpperCase()}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {caseStudy.published_date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-4">
            {content.title}
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            {isBn ? caseStudy.tagline_bn : caseStudy.tagline_en}
          </p>

          {/* Action Links & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200 dark:border-gray-800 mb-8">
            <div className="flex flex-wrap gap-2">
              {caseStudy.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {caseStudy.project_links.live_url && (
                <a
                  href={caseStudy.project_links.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-105 transition-all"
                >
                  <span>{isBn ? "লাইভ অ্যাপ দেখুন" : "Live Demo"}</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </a>
              )}
              {caseStudy.project_links.github_url && (
                <a
                  href={caseStudy.project_links.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 text-xs font-bold transition-all"
                >
                  <FaGithub className="text-sm" />
                  <span>{isBn ? "সোর্স কোড" : "GitHub"}</span>
                </a>
              )}
            </div>
          </div>

          {/* Hero Thumbnail */}
          {caseStudy.thumbnail?.src && (
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl bg-gray-900 mb-10">
              <Image
                src={caseStudy.thumbnail.src}
                alt={isBn ? caseStudy.thumbnail.alt_bn : caseStudy.thumbnail.alt_en}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover object-top"
              />
            </div>
          )}

          {/* ── GEO Snapshot Callout (AI quotable summary) ── */}
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/30 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              <FaLightbulb />
              <span>{isBn ? "সংক্ষিপ্ত সারসংক্ষেপ (Executive Summary)" : "GEO Snapshot & Overview"}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
              {content.problem}
            </p>
          </div>
        </header>

        {/* ── Main Markdown Article ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <div className="bg-white dark:bg-gray-900/70 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 sm:p-10 shadow-sm">
            <ArticleContent content={content.article} />
          </div>
        </div>

        {/* ── Challenge & Breakthrough Card ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-8 shadow-sm">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm mb-3">
              <FaExclamationTriangle />
              <span>{isBn ? "আসল কারিগরি চ্যালেঞ্জ ও সমাধান" : "The Core Engineering Challenge & Breakthrough"}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {content.challenge}
            </p>
          </div>
        </section>

        {/* ── Measurable Results ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 p-8 shadow-sm">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-3">
              <FaCheckCircle />
              <span>{isBn ? "বাস্তব ফলাফল ও অর্জন" : "Measurable Results & Impact"}</span>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {content.result}
            </p>
          </div>
        </section>

        {/* ── Conversion CTA ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 p-8 sm:p-12 text-white shadow-xl text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              {isBn
                ? "আপনার প্রজেক্টের জন্য একই মানের আর্কিটেকচার চান?"
                : "Looking for Similar Production-Ready Architecture?"}
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              {isBn
                ? "ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন, এআই এজেন্ট বা কাস্টম ব্যাকএন্ড — আপনার প্রজেক্টের রিকোয়ারমেন্ট নিয়ে বিস্তারিত আলোচনা করা যাক।"
                : "From high-performance web applications to autonomous AI workflows, I help founders turn ideas into resilient products."}
            </p>
            <Link
              href={servicesHref}
              id="casestudy-bottom-cta"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-bold text-sm sm:text-base shadow-lg hover:bg-indigo-50 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <FaRocket />
              <span>{isBn ? "হায়ার করুন ও প্রজেক্ট শুরু করুন" : "Hire Me / Start a Project"}</span>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
