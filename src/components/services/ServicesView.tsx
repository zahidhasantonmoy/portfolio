import React from "react";
import Link from "next/link";
import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaLanguage,
} from "react-icons/fa";
import {
  servicesBilingual,
  processBilingual,
  techStack,
  labels,
  FULL_SAME_AS,
  type Lang,
} from "./servicesData";
import MiniContactForm from "./MiniContactForm";

interface ServicesViewProps {
  lang: Lang;
}

export default function ServicesView({ lang }: ServicesViewProps) {
  const tx = labels[lang];
  const isBn = lang === "bn";
  const currentUrl = isBn
    ? "https://zahidhasantonmoy.vercel.app/bn/services"
    : "https://zahidhasantonmoy.vercel.app/services";

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${currentUrl}#service`,
    name: isBn
      ? "জাহিদ হাসান তন্ময় — ফুল-স্ট্যাক ও এআই ডেভেলপমেন্ট সার্ভিসেস"
      : "Zahid Hasan Tonmoy — Full Stack & AI Development Services",
    url: currentUrl,
    inLanguage: isBn ? "bn" : "en",
    description: isBn
      ? "ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন, এআই এজেন্ট, এপিআই ইন্টিগ্রেশন এবং টেকনিক্যাল কনসালটিং। ঢাকা থেকে বিশ্বব্যাপী ফ্রিল্যান্স, কনট্রাক্ট ও রিমোট কাজের জন্য প্রস্তুত।"
      : "Full-stack web development, AI agent development, API integration, and technical consulting. Available for freelance, contract, and remote work worldwide.",
    email: "zahidhasantonmoy.dev@gmail.com",
    provider: {
      "@type": "Person",
      "@id": "https://zahidhasantonmoy.vercel.app/#person",
      name: isBn ? "জাহিদ হাসান তন্ময়" : "Zahid Hasan Tonmoy",
      url: "https://zahidhasantonmoy.vercel.app",
      jobTitle: isBn
        ? "ফুল-স্ট্যাক ওয়েব ও এআই এজেন্ট ডেভেলপার"
        : "MERN Full Stack Developer & AI Agent Developer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressRegion: "Dhaka Division",
        addressCountry: "BD",
      },
      sameAs: FULL_SAME_AS,
    },
    areaServed: "Worldwide",
    availableLanguage: ["English", "Bengali"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: isBn ? "ডেভেলপমেন্ট সার্ভিসেস" : "Development Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isBn ? "ফুল-স্ট্যাক ওয়েব MVP ডেভেলপমেন্ট" : "Full-Stack Web MVP Development",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isBn ? "এআই এজেন্ট ডেভেলপমেন্ট" : "AI Agent Development",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isBn ? "API ও অটোমেশন ডেভেলপমেন্ট" : "API & Automation Development",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: isBn ? "টেকনিক্যাল কনসালটিং" : "Technical Consulting",
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
            <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Language Switcher Link (Crawlable SSR link) */}
            <Link
              href={tx.switchHref}
              id="lang-switch-btn"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all mb-5 shadow-sm"
              title={isBn ? "Switch to English" : "বাংলা সংস্করণে যান"}
            >
              <FaLanguage className="text-sm" /> {tx.switchLang}
            </Link>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-6 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              {tx.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              {tx.h1a}{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {tx.h1b}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
              {tx.heroDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {techStack.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <Icon className="text-sm" />
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact-form"
                id="hire-me-primary-cta"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all group"
              >
                <FaEnvelope className="text-sm" />
                <span>{tx.ctaPrimary}</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/#projects"
                id="view-projects-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-800 dark:text-gray-200 font-semibold text-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all shadow-sm"
              >
                {tx.ctaProjects}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Services Grid ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              {tx.servicesH2}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {tx.servicesDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servicesBilingual.map((svc) => {
              const Icon = svc.icon;
              const d = svc[lang];
              return (
                <article
                  key={d.title}
                  className={`relative rounded-3xl border ${svc.borderColor} ${svc.hoverBorder} bg-white dark:bg-gray-900/60 p-8 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-sm`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`text-xl ${svc.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">
                    {d.title}
                  </h3>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-4 font-mono">
                    {d.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                    {d.description}
                  </p>
                  <ul className="space-y-2">
                    {d.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <FaCheckCircle className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5 text-xs" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Process ── */}
        <section className="bg-white dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                {tx.processH2}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                {tx.processDesc}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {processBilingual.map((step) => {
                const d = step[lang];
                return (
                  <div key={step.step} className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                      <span className="text-white font-extrabold text-lg">{step.step}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">
                      {d.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {d.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            {tx.pricingH2}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">
            {tx.pricingDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {tx.pricingTiers.map((tier) => (
              <div
                key={tier.label}
                className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 text-left shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-2">{tier.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {tier.desc}
                </p>
              </div>
            ))}
          </div>
          <a
            href="#contact-form"
            id="pricing-contact-cta"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all group"
          >
            <FaEnvelope className="text-sm" />
            <span>{tx.pricingBtn}</span>
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </a>
        </section>

        {/* ── Embedded Contact Form ── */}
        <section id="contact-form" className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
          <div className="rounded-3xl border border-indigo-200/60 dark:border-indigo-900/50 bg-white dark:bg-gray-900/80 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
                {tx.formH2}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tx.formDesc}</p>
            </div>
            <MiniContactForm lang={lang} tx={tx} />
            <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
              {tx.emailLabel}{" "}
              <a
                href="mailto:zahidhasantonmoy.dev@gmail.com"
                id="mailto-fallback"
                className="text-indigo-500 hover:underline font-medium"
              >
                zahidhasantonmoy.dev@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* ── Bottom Banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 py-16 px-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              {tx.bannerH2}
            </h2>
            <p className="text-indigo-200 text-base leading-relaxed mb-8">{tx.bannerDesc}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact-form"
                id="bottom-hire-cta"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg"
              >
                <FaEnvelope />
                {tx.ctaPrimary}
              </a>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/zahidhasantonmoy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <FaGithub size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/in/zahidhasantonmoy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                >
                  <FaLinkedin size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
