"use client";
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import AskAssistant from '@/components/AskAssistant';

const ROLE_WORDS = ['websites', 'mobile apps', 'AI agents', 'data tools', 'online shops'];
const MARQUEE_ITEMS = ['REACT', 'NODE.JS', 'NEXT.JS', 'TYPESCRIPT', 'PYTHON', 'AI AGENTS', 'FLUTTER', 'SUPABASE', 'MONGODB', 'PANDAS', 'DHAKA → WORLDWIDE'];

interface HeroProps {
  name: string;
  projectCount: number;
  postCount?: number;
}

const Hero = ({ name, projectCount, postCount }: HeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [repoCount, setRepoCount] = useState<number | null>(null);

  // Rotating role word (2.6s) — skipped when the user prefers reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setWordVisible(false);
      window.setTimeout(() => {
        setRoleIndex((i) => (i + 1) % ROLE_WORDS.length);
        setWordVisible(true);
      }, 180);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  // Respect reduced motion for the background video too.
  useEffect(() => {
    const video = videoRef.current;
    if (video && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay');
      void video.pause();
    }
  }, []);

  // Live public repo count from GitHub (no hardcoded number).
  useEffect(() => {
    let cancelled = false;
    fetch('https://api.github.com/users/zahidhasantonmoy')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.public_repos === 'number') {
          setRepoCount(data.public_repos);
        }
      })
      .catch(() => {
        // Repo count stays hidden instead of showing a made-up number.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="home" className="relative overflow-hidden pb-2.5 pt-24 sm:pt-[104px]">
      {/* Video background */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          tabIndex={-1}
          className="h-full w-full object-cover opacity-85"
        >
          <source src="/videos/hero-dhaka-night.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,19,0.78)_0%,rgba(6,10,19,0.62)_46%,var(--bg)_97%)]" />
      </div>

      <div className="wrap relative z-[1] grid gap-[30px] lg:grid-cols-[1.12fr_0.88fr] lg:gap-11 lg:items-start">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center gap-[9px] rounded-full border-[1.5px] border-line bg-card py-2 pl-3 pr-4 text-sm font-bold text-ink-soft">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
            </span>
            Open for work — freelance &amp; full-time
          </span>

          <h1 className="mb-1.5 mt-5 font-display text-[clamp(37px,7.2vw,74px)] font-black uppercase leading-[1.04] tracking-[-0.01em]">
            Zahid
            <br />
            Hasan <span className="font-medium text-cyan">Tonmoy</span>
          </h1>

          <p className="mt-3 text-[clamp(20px,3vw,27px)] font-extrabold leading-[1.3]">
            I build{' '}
            <span
              className="inline-block min-w-[7.5ch] border-b-[3px] border-amber text-amber transition-opacity duration-200"
              style={{ opacity: wordVisible ? 1 : 0 }}
            >
              {ROLE_WORDS[roleIndex]}
            </span>
            <br />
            that solve real problems.
          </p>

          <p className="mt-3.5 max-w-[52ch] text-lg text-ink-soft">
            MERN full-stack developer, data analyst and AI agent builder from{' '}
            <strong className="text-ink">Mirpur, Dhaka</strong> — and a computer science student at BUBT.
            Online shops, mobile apps, and smart tools that use data and AI to do useful work.{' '}
            <strong className="text-ink">Everything here is explained in plain words.</strong>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a className="btn btn-amber btn-hire" href="#contact">
              Hire me →
            </a>
            <a className="btn btn-ghost" href="#work">
              See my work ↓
            </a>
            <a
              href="#ask"
              className="inline-flex min-h-[52px] items-center gap-[9px] rounded-full border-[1.5px] border-cyan-deep bg-card py-2.5 pl-3 pr-5 text-[15.5px] font-extrabold text-ink transition-transform duration-150 hover:-translate-y-0.5 hover:border-cyan"
            >
              <span className="rounded-full bg-cyan px-2.5 py-[5px] font-display text-xs font-black leading-none text-[#04121a]">
                AI
              </span>
              Ask me anything
            </a>
          </div>

          <div className="mt-[22px] flex flex-wrap gap-x-[22px] gap-y-2 text-[14.5px] font-semibold text-ink-mute">
            <span>
              <b className="text-ink">{projectCount}</b> finished projects
            </span>
            {typeof postCount === 'number' && (
              <span>
                <b className="text-ink">{postCount}</b> blog posts
              </span>
            )}
            <span>
              <b className="text-ink">2024</b> competition winner
            </span>
            {repoCount !== null && (
              <span>
                <b className="text-ink">{repoCount}</b> public GitHub repos
              </span>
            )}
          </div>
        </div>

        {/* Right column: portrait stage + ask assistant */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-[26px] border-[1.5px] border-cyan-deep bg-card shadow-[0_0_44px_rgba(47,216,242,0.16),0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="relative h-[400px] w-full sm:h-[480px]">
              <Image
                src="/images/portrait-suit.jpg"
                alt={`Portrait of ${name}`}
                fill
                sizes="(max-width: 960px) 100vw, 45vw"
                priority
                className="object-cover object-top"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(4,10,20,0.72))]" />
            <div className="absolute bottom-[14px] left-[18px] z-[2] text-white">
              <div className="font-display text-[19px] font-bold leading-[1.15]">Zahid Hasan Tonmoy</div>
              <div className="mt-[3px] font-mono text-[12.5px] tracking-[0.05em] text-[#bfe9ff]">
                MIRPUR · DHAKA · WORKING WORLDWIDE
              </div>
            </div>
          </div>

          <div className="absolute left-2 top-4 z-[3] flex animate-float items-center gap-[9px] rounded-[14px] border-[1.5px] border-line bg-card/95 p-[9px_14px] text-[13.5px] font-extrabold leading-[1.25] shadow-[0_10px_26px_rgba(0,0,0,0.3)] sm:-left-2">
            <span className="text-[19px] leading-none" aria-hidden="true">
              🏆
            </span>
            <span>
              Winner 2024
              <small className="block text-xs font-semibold text-ink-mute">Software competition</small>
            </span>
          </div>
          <div
            className="absolute right-2 top-[118px] z-[3] flex animate-float items-center gap-[9px] rounded-[14px] border-[1.5px] border-line bg-card/95 p-[9px_14px] text-[13.5px] font-extrabold leading-[1.25] shadow-[0_10px_26px_rgba(0,0,0,0.3)] sm:-right-2"
            style={{ animationDelay: '1.4s' }}
          >
            <span className="text-[19px] leading-none" aria-hidden="true">
              🛠️
            </span>
            <span>
              {projectCount} projects
              <small className="block text-xs font-semibold text-ink-mute">Web · apps · data · AI</small>
            </span>
          </div>
          <div
            className="absolute right-2 top-[312px] z-[3] flex animate-float items-center gap-[9px] rounded-[14px] border-[1.5px] border-line bg-card/95 p-[9px_14px] text-[13.5px] font-extrabold leading-[1.25] shadow-[0_10px_26px_rgba(0,0,0,0.3)] sm:-right-1.5 sm:top-[396px]"
            style={{ animationDelay: '2.6s' }}
          >
            <span className="text-[19px] leading-none" aria-hidden="true">
              ✍️
            </span>
            <span>
              {typeof postCount === 'number' ? `${postCount} articles` : 'Blog articles'}
              <small className="block text-xs font-semibold text-ink-mute">Mostly about AI agents</small>
            </span>
          </div>

          <AskAssistant />
        </div>
      </div>

      {/* Marquee strip */}
      <div className="marquee relative z-[1]" aria-hidden="true">
        <div className="mq-track">
          {[0, 1].map((copy) => (
            <span key={copy}>
              {MARQUEE_ITEMS.map((item) => (
                <span key={`${copy}-${item}`}>
                  {item} <b>◆</b>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
