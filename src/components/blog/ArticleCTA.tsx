'use client';

import React from 'react';
import Link from 'next/link';
import { FaRocket, FaArrowRight, FaCheckCircle, FaLaptopCode } from 'react-icons/fa';

interface ArticleCTAProps {
  lang?: 'en' | 'bn';
}

export default function ArticleCTA({ lang = 'en' }: ArticleCTAProps) {
  const isBn = lang === 'bn';

  return (
    <div className="relative my-12 overflow-hidden rounded-3xl border-[1.5px] border-[#1a2947] bg-[#0e1729] p-8 sm:p-10 shadow-xl backdrop-blur-sm">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#2fd8f2]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-[#ffb02e]/10 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        {/* Left side: Heading, status pill, and value proposition */}
        <div className="max-w-2xl space-y-4">
          {/* Availability Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#3ddc84]/10 border border-[#3ddc84]/30 text-[#3ddc84] text-xs font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ddc84] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ddc84]" />
            </span>
            <span>
              {isBn
                ? '🟢 ফ্রিল্যান্স ও কনট্রাক্ট প্রজেক্টের জন্য উন্মুক্ত'
                : '🟢 Available for Freelance & Contract Work'}
            </span>
          </div>

          {/* Main Hook */}
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#eef4ff] tracking-tight leading-tight">
            {isBn ? (
              <>
                কাস্টম ওয়েব অ্যাপ বা{' '}
                <span className="text-[#2fd8f2]">এআই অটোমেশন</span>{' '}
                বানাতে চান?
              </>
            ) : (
              <>
                Need a High-Performance Web App or{' '}
                <span className="text-[#2fd8f2]">Custom AI Solution?</span>
              </>
            )}
          </h3>

          <p className="text-sm sm:text-base text-[#c3d2ea] leading-relaxed">
            {isBn
              ? 'আমি স্টার্টআপ ও আধুনিক ব্যবসার জন্য স্কেলেবল ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন (Next.js, React, Node, PostgreSQL) এবং ইন্টেলিজেন্ট এআই এজেন্ট সলিউশন তৈরি করি। আপনার প্রজেক্টের আইডিয়া নিয়ে কথা বলা যাক!'
              : 'I help founders, businesses, and engineering teams build lightning-fast web applications, resilient backend architectures, and intelligent AI workflows. Have an idea in mind? Let’s bring it to life.'}
          </p>

          {/* Quick bullet points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#c3d2ea] font-medium">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-[#2fd8f2] flex-shrink-0" />
              <span>{isBn ? 'ফুল-স্ট্যাক এমভিপি (MVP) ডেভেলপমেন্ট' : 'Fast MVP Launch (2–4 weeks)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-[#2fd8f2] flex-shrink-0" />
              <span>{isBn ? 'অটোনোমাস এআই এজেন্ট ও এলএলএম ইন্টিগ্রেশন' : 'AI Agent & LLM API Integration'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-[#2fd8f2] flex-shrink-0" />
              <span>{isBn ? 'পারফেক্ট এসইও ও সর্বোচ্চ পারফরম্যান্স' : '100/100 Core Web Vitals & SEO'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-[#2fd8f2] flex-shrink-0" />
              <span>{isBn ? 'ক্লিন কোড ও মডার্ন আর্কিটেকচার' : 'Production-Ready Clean Architecture'}</span>
            </div>
          </div>
        </div>

        {/* Right side: Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 flex-shrink-0 w-full lg:w-auto">
          <Link
            href={isBn ? "/bn/services#contact-form" : "/services"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ffb02e] hover:bg-[#2fd8f2] text-[#1a1200] font-semibold text-sm shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <FaRocket className="text-xs group-hover:rotate-12 transition-transform duration-300" />
            <span>{isBn ? 'হায়ার করুন / প্রজেক্ট শুরু করুন' : 'Hire Me / Start a Project'}</span>
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          <Link
            href="/#projects"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#122036] hover:bg-[#1a2947] text-[#eef4ff] font-semibold text-sm border-[1.5px] border-[#22345a] shadow-sm hover:border-[#0e7d99] transition-all group"
          >
            <FaLaptopCode className="text-[#2fd8f2]" />
            <span>{isBn ? 'পূর্ববর্তী প্রজেক্ট দেখুন' : 'Explore Featured Projects'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
