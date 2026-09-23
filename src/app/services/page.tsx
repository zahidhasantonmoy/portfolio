import type { Metadata } from "next";
import Link from "next/link";
import {
  FaRocket,
  FaRobot,
  FaPlug,
  FaComments,
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { SiNextdotjs, SiReact, SiNodedotjs, SiPostgresql, SiTypescript, SiPython } from "react-icons/si";

export const metadata: Metadata = {
  title: "Services & Hire Me | Zahid Hasan Tonmoy — Full Stack & AI Developer",
  description:
    "Hire Zahid Hasan Tonmoy for full-stack web development, AI agent development, API integration, and technical consulting. Based in Dhaka, available worldwide for freelance & remote work.",
  openGraph: {
    title: "Services & Hire Me | Zahid Hasan Tonmoy",
    description:
      "Full-Stack MVP development, AI Agent integration, and technical consulting — available for freelance, contract, and remote work worldwide.",
    url: "https://zahidhasantonmoy.vercel.app/services",
    type: "website",
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/services",
  },
};

const services = [
  {
    icon: FaRocket,
    iconColor: "text-indigo-400",
    gradientFrom: "from-indigo-600/10",
    gradientTo: "to-purple-600/10",
    borderColor: "border-indigo-500/20",
    hoverBorder: "hover:border-indigo-500/50",
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
  {
    icon: FaRobot,
    iconColor: "text-purple-400",
    gradientFrom: "from-purple-600/10",
    gradientTo: "to-pink-600/10",
    borderColor: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    title: "AI Agent Development",
    subtitle: "LLM · LangChain · Tool Calling · Streaming",
    description:
      "Custom autonomous AI agents that think, plan, and act. I integrate LLMs into your product with streaming UI, tool calling, RAG pipelines, and robust fallback logic.",
    deliverables: [
      "Custom AI agents with tool calling (Gemini / GPT / Groq)",
      "RAG pipelines with vector search",
      "Streaming real-time UI (Server-Sent Events / WebSocket)",
      "AI workflow automation & scheduling",
      "Multi-provider fallback for 99.9% uptime",
    ],
  },
  {
    icon: FaPlug,
    iconColor: "text-cyan-400",
    gradientFrom: "from-cyan-600/10",
    gradientTo: "to-blue-600/10",
    borderColor: "border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/50",
    title: "API & Automation",
    subtitle: "REST · Webhooks · Zapier · Cron Jobs",
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
  {
    icon: FaComments,
    iconColor: "text-emerald-400",
    gradientFrom: "from-emerald-600/10",
    gradientTo: "to-teal-600/10",
    borderColor: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    title: "Technical Consulting",
    subtitle: "Architecture · Code Review · SEO · Performance",
    description:
      "Need a second pair of expert eyes? I audit your codebase, optimize performance, fix SEO issues, and advise on architecture decisions for your team.",
    deliverables: [
      "Architecture review & recommendations",
      "Core Web Vitals & performance audit",
      "SEO + GEO (AI crawler optimization) audit",
      "Code review & refactoring guidance",
      "Tech stack selection & roadmap planning",
    ],
  },
];

const process = [
  {
    step: "01",
    title: "Discovery Call",
    description:
      "We talk about your goals, timeline, and budget. I ask the right questions to fully understand what you need before writing a single line of code.",
  },
  {
    step: "02",
    title: "Proposal & Scope",
    description:
      "I send a clear written proposal: scope of work, deliverables, timeline, and pricing. No hidden fees, no scope creep surprises.",
  },
  {
    step: "03",
    title: "Build & Iterate",
    description:
      "Development starts. You get regular updates, staging previews, and a direct line to ask questions. Fast feedback loops, no black boxes.",
  },
  {
    step: "04",
    title: "Launch & Handoff",
    description:
      "Deployment, documentation, and knowledge transfer. Your team knows how to maintain and extend everything I build.",
  },
];

const techStack = [
  { icon: SiNextdotjs, label: "Next.js" },
  { icon: SiReact, label: "React" },
  { icon: SiNodedotjs, label: "Node.js" },
  { icon: SiPostgresql, label: "PostgreSQL" },
  { icon: SiTypescript, label: "TypeScript" },
  { icon: SiPython, label: "Python" },
];

export default function ServicesPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://zahidhasantonmoy.vercel.app/services#service",
    name: "Zahid Hasan Tonmoy — Full Stack & AI Development Services",
    url: "https://zahidhasantonmoy.vercel.app/services",
    description:
      "Full-stack web development, AI agent development, API integration, and technical consulting services. Available for freelance, contract, and remote work worldwide.",
    provider: {
      "@type": "Person",
      "@id": "https://zahidhasantonmoy.vercel.app/#person",
      name: "Zahid Hasan Tonmoy",
      url: "https://zahidhasantonmoy.vercel.app",
      jobTitle: "MERN Full Stack Developer & AI Agent Developer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressCountry: "BD",
      },
      sameAs: [
        "https://github.com/zahidhasantonmoy",
        "https://www.linkedin.com/in/zahidhasantonmoy/",
      ],
    },
    areaServed: "Worldwide",
    availableLanguage: ["English", "Bengali"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Development Services",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-20 px-4">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
            <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/5 blur-[150px]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-6 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              Available for Freelance · Contract · Remote Work
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              {"Let's Build Something "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Exceptional
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
              I&apos;m Zahid — a Full-Stack Developer & AI Engineer based in Dhaka, Bangladesh. I help founders,
              startups, and engineering teams turn complex ideas into fast, scalable, production-ready products.
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
                href="mailto:zahidhasantonmoy.dev@gmail.com"
                id="hire-me-email-cta"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all group"
              >
                <FaEnvelope className="text-sm" />
                <span>{"Let's Talk — Get in Touch"}</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/#projects"
                id="view-projects-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 font-semibold text-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all shadow-sm"
              >
                View My Projects
              </Link>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              What I Can Build for You
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Each engagement is tailored to your specific needs — no cookie-cutter templates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <article
                  key={svc.title}
                  className={`relative rounded-3xl border ${svc.borderColor} ${svc.hoverBorder} bg-white dark:bg-gray-900/60 p-8 shadow-sm hover:shadow-lg transition-all duration-300 group backdrop-blur-sm`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`text-xl ${svc.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{svc.title}</h3>
                  <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-4 font-mono">{svc.subtitle}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">{svc.description}</p>
                  <ul className="space-y-2">
                    {svc.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <FaCheckCircle className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5 text-xs" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* Process */}
        <section className="bg-white dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                How We Work Together
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                A simple, transparent process — no surprises, no guesswork.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {process.map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                    <span className="text-white font-extrabold text-lg">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Pricing
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">
            Every project is different in scope, complexity, and timeline. I provide a clear, itemized quote after a
            short discovery call — no hidden fees, no surprise invoices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Project-Based", desc: "Fixed scope, fixed price. Best for MVPs and defined deliverables." },
              { label: "Hourly / Retainer", desc: "Flexible engagement for ongoing work, audits, or consulting." },
              { label: "Equity / Part-Time", desc: "Open to early-stage startup partnerships on a case-by-case basis." },
            ].map((tier) => (
              <div
                key={tier.label}
                className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 text-left shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-2">{tier.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tier.desc}</p>
              </div>
            ))}
          </div>

          <a
            href="mailto:zahidhasantonmoy.dev@gmail.com?subject=Project Inquiry"
            id="pricing-contact-cta"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold text-base shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all group"
          >
            <FaEnvelope className="text-sm" />
            <span>Contact for Pricing</span>
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </a>
        </section>

        {/* Bottom CTA Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-800 py-16 px-4">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to Start a Project?
            </h2>
            <p className="text-indigo-200 text-base leading-relaxed mb-8">
              {"Send me a message describing your project and I'll get back to you within 24 hours."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:zahidhasantonmoy.dev@gmail.com?subject=Project Inquiry"
                id="bottom-hire-cta"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg"
              >
                <FaEnvelope />
                zahidhasantonmoy.dev@gmail.com
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
