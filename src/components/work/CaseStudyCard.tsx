import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaExternalLinkAlt, FaGithub, FaArrowRight } from "react-icons/fa";
import type { CaseStudy } from "@/types/case-study";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  lang: "en" | "bn";
}

export default function CaseStudyCard({ caseStudy, lang }: CaseStudyCardProps) {
  const isBn = lang === "bn";
  const content = isBn ? caseStudy.bangla : caseStudy.english;
  const tagline = isBn ? caseStudy.tagline_bn : caseStudy.tagline_en;
  const detailHref = isBn
    ? `/bn/work/${caseStudy.slug}`
    : `/work/${caseStudy.slug}`;

  const categoryLabels: Record<string, { en: string; bn: string }> = {
    "web-app": { en: "Web Application", bn: "ওয়েব অ্যাপ্লিকেশন" },
    "ai-tool": { en: "AI Tool & Agent", bn: "এআই টুল ও এজেন্ট" },
    automation: { en: "Automation & API", bn: "অটোমেশন ও এপিআই" },
    iot: { en: "IoT & Hardware", bn: "আইওটি ও হার্ডওয়্যার" },
    "research-project": { en: "Research & ML", bn: "রিসার্চ ও মেশিন লার্নিং" },
  };

  const categoryName =
    categoryLabels[caseStudy.category]?.[lang] || caseStudy.category;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:border-blue-500/50 hover:shadow-glow-sm"
      style={{
        background: "var(--bg-surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden" style={{ background: "var(--bg-base)" }}>
        {caseStudy.thumbnail?.src ? (
          <Image
            src={caseStudy.thumbnail.src}
            alt={isBn ? caseStudy.thumbnail.alt_bn : caseStudy.thumbnail.alt_en}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
            {caseStudy.project_name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Category Pill */}
        <div className="absolute top-4 left-4">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border"
            style={{
              background: "rgba(10, 14, 23, 0.8)",
              color: "var(--accent-secondary)",
              borderColor: "rgba(6, 182, 212, 0.3)",
            }}
          >
            {categoryName}
          </span>
        </div>

        {/* External links */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {caseStudy.project_links.live_url && (
            <a
              href={caseStudy.project_links.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-white transition-all backdrop-blur-md hover:scale-110"
              style={{
                background: "rgba(10, 14, 23, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              title="Live Demo"
              aria-label="Live Demo"
            >
              <FaExternalLinkAlt className="text-xs" />
            </a>
          )}
          {caseStudy.project_links.github_url && (
            <a
              href={caseStudy.project_links.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-white transition-all backdrop-blur-md hover:scale-110"
              style={{
                background: "rgba(10, 14, 23, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              title="GitHub Code"
              aria-label="GitHub Repository"
            >
              <FaGithub className="text-sm" />
            </a>
          )}
        </div>

        {/* Project Name bottom title */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
            {caseStudy.project_name}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-col flex-1 p-6">
        <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {tagline}
        </p>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {caseStudy.tech_stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-xs font-mono"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                color: "var(--accent-primary)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              {tech}
            </span>
          ))}
          {caseStudy.tech_stack.length > 4 && (
            <span className="px-2 py-1 rounded-md text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
              +{caseStudy.tech_stack.length - 4}
            </span>
          )}
        </div>

        {/* Read Case Study Button */}
        <div className="mt-auto pt-2">
          <Link
            href={detailHref}
            className="w-full inline-flex items-center justify-between px-5 py-3 rounded-2xl text-sm font-semibold transition-all group/btn border shadow-sm hover:border-blue-500 hover:text-blue-500"
            style={{
              background: "var(--bg-base)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <span>{isBn ? "কেস স্টাডি পড়ুন" : "Read Case Study"}</span>
            <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
