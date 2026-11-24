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
      <main className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15" style={{ background: 'var(--accent-primary)' }} />
            <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15" style={{ background: 'var(--accent-secondary)' }} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Language Switcher Link (Crawlable SSR link) */}
            <Link
              href={tx.switchHref}
              id="lang-switch-btn"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all mb-5 shadow-sm hover:border-blue-500"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              title={isBn ? "Switch to English" : "বাংলা সংস্করণে যান"}
            >
              <FaLanguage className="text-sm" /> {tx.switchLang}
            </Link>

            {/* Availability Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm border"
              style={{
                background: "rgba(34, 197, 94, 0.1)",
                borderColor: "rgba(34, 197, 94, 0.3)",
                color: "var(--success)",
              }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              {tx.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6" style={{ color: "var(--text-primary)" }}>
              {tx.h1a}{" "}
              <span className="gradient-text">
                {tx.h1b}
              </span>
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "var(--text-secondary)" }}>
              {tx.heroDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {techStack.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border shadow-sm"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Icon className="text-sm text-blue-500" />
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact-form"
                id="hire-me-primary-cta"
                className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base group"
              >
                <FaEnvelope className="text-sm" />
                <span>{tx.ctaPrimary}</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/#projects"
                id="view-projects-btn"
                className="btn-ghost inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm"
              >
                {tx.ctaProjects}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Services Grid ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 gradient-text">
              {tx.servicesH2}
            </h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
              {tx.servicesDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[14px]">
            {servicesBilingual.map((svc) => {
              const Icon = svc.icon;
              const d = svc[lang];
              return (
                <article
                  key={d.title}
                  className="relative rounded-[20px] border-[1.5px] border-line-soft bg-card p-[22px] shadow-sm transition-colors duration-300 group hover:border-cyan-deep"
                >
                  <div
                    className="w-[50px] h-[50px] rounded-[15px] flex items-center justify-center mb-[14px] shadow-sm group-hover:scale-110 transition-transform duration-300 border-[1.5px] border-line bg-card2 text-cyan"
                  >
                    <Icon className={`text-xl ${svc.iconColor}`} />
                  </div>
                  <h3 className="text-[19.5px] font-extrabold leading-[1.2] mb-[7px] text-ink">
                    {d.title}
                  </h3>
                  <p className="text-xs font-medium mb-4 font-mono text-amber">
                    {d.subtitle}
                  </p>
                  <p className="text-[15px] leading-relaxed mb-5 text-ink-soft">
                    {d.description}
                  </p>
                  <ul className="space-y-1">
                    {d.deliverables.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[14.5px] text-ink-soft"
                      >
                        <FaCheckCircle className="flex-shrink-0 mt-0.5 text-xs text-cyan" />
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
        <section
          className="border-y py-16 px-4"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 gradient-text">
                {tx.processH2}
              </h2>
              <p className="max-w-lg mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
                {tx.processDesc}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
              {processBilingual.map((step) => {
                const d = step[lang];
                return (
                  <div key={step.step} className="rounded-[20px] border-[1.5px] border-line-soft bg-card2 p-5 text-left">
                    <div className="font-display text-[26px] font-black text-amber">{step.step}</div>
                    <h3 className="font-extrabold text-[17px] mb-1 mt-[7px] text-ink">
                      {d.title}
                    </h3>
                    <p className="text-[14.5px] leading-relaxed text-ink-soft">
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
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 gradient-text">
            {tx.pricingH2}
          </h2>
          <p className="leading-relaxed mb-8 max-w-xl mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            {tx.pricingDesc}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {tx.pricingTiers.map((tier) => (
              <div
                key={tier.label}
                className="p-6 rounded-[20px] text-left border-[1.5px] border-line-soft bg-card shadow-sm transition-colors hover:border-cyan-deep"
              >
                <p className="font-bold text-sm mb-2 text-ink">{tier.label}</p>
                <p className="text-xs leading-relaxed text-ink-soft">
                  {tier.desc}
                </p>
              </div>
            ))}
          </div>
          <a
            href="#contact-form"
            id="pricing-contact-cta"
            className="btn-primary inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base group"
          >
            <FaEnvelope className="text-sm" />
            <span>{tx.pricingBtn}</span>
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </a>
        </section>

        {/* ── Embedded Contact Form ── */}
        <section id="contact-form" className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-border shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold mb-1 gradient-text">
                {tx.formH2}
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{tx.formDesc}</p>
            </div>
            <MiniContactForm lang={lang} tx={tx} />
            <p className="mt-5 text-center text-xs" style={{ color: "var(--text-secondary)" }}>
              {tx.emailLabel}{" "}
              <a
                href="mailto:zahidhasantonmoy.dev@gmail.com"
                id="mailto-fallback"
                className="font-medium hover:underline"
                style={{ color: "var(--accent-primary)" }}
              >
                zahidhasantonmoy.dev@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* ── Bottom Banner ── */}
        <section
          className="relative overflow-hidden py-16 px-4 border-t"
          style={{
            background: "linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)",
            borderColor: "var(--border)",
          }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "var(--accent-primary)" }} />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "var(--accent-secondary)" }} />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 gradient-text">
              {tx.bannerH2}
            </h2>
            <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              {tx.bannerDesc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact-form"
                id="bottom-hire-cta"
                className="btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm"
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
                  className="p-3 rounded-xl border transition-all hover:scale-110 hover:border-blue-500 hover:text-blue-500"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <FaGithub size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/in/zahidhasantonmoy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-3 rounded-xl border transition-all hover:scale-110 hover:border-blue-500 hover:text-blue-500"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
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
