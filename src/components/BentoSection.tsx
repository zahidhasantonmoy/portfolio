"use client";
import { useEffect, useState } from 'react';

interface BentoSectionProps {
  projectCount: number;
  postCount?: number;
}

const BentoSection = ({ projectCount, postCount }: BentoSectionProps) => {
  const [repoCount, setRepoCount] = useState<number | null>(null);

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
        // Repo stat stays hidden instead of showing a made-up number.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="glance" className="wrap pb-1.5 pt-[34px]">
      <div className="sec-head">
        <span className="sec-tag">The short version</span>
        <h2>Everything important, in 10 seconds</h2>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <div className="col-span-2 rounded-[20px] border-[1.5px] border-line-soft bg-card p-5 transition-colors hover:border-cyan-deep">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-mute">What I do</span>
          <h3 className="mt-1.5 text-[19px] font-extrabold leading-[1.25]">Three kinds of work, one person</h3>
          <ul className="mt-2 grid list-none gap-[7px]">
            <li className="relative pl-[22px] text-[15px] text-ink-soft">
              <span className="absolute left-[2px] font-black text-amber">▸</span>
              <b className="text-ink">Websites &amp; apps</b> — shops, dashboards, mobile apps that people actually use
            </li>
            <li className="relative pl-[22px] text-[15px] text-ink-soft">
              <span className="absolute left-[2px] font-black text-amber">▸</span>
              <b className="text-ink">Data</b> — turning messy numbers into clear answers and predictions
            </li>
            <li className="relative pl-[22px] text-[15px] text-ink-soft">
              <span className="absolute left-[2px] font-black text-amber">▸</span>
              <b className="text-ink">AI agents</b> — smart tools that answer, search and do repeat work for you
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-1.5 rounded-[20px] border-[1.5px] border-line-soft bg-card p-5 transition-colors hover:border-cyan-deep">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-mute">Finished projects</span>
          <span className="font-display text-[clamp(30px,4vw,44px)] font-black leading-none text-ink">{projectCount}</span>
          <p className="text-[14.5px] text-ink-soft">Complete and working — not half-done demos.</p>
        </div>

        {typeof postCount === 'number' && (
          <div className="flex flex-col gap-1.5 rounded-[20px] border-[1.5px] border-line-soft bg-card p-5 transition-colors hover:border-cyan-deep">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-mute">Blog posts written</span>
            <span className="font-display text-[clamp(30px,4vw,44px)] font-black leading-none text-amber">{postCount}</span>
            <p className="text-[14.5px] text-ink-soft">Teaching what I learn, mostly about AI agents.</p>
          </div>
        )}

        {repoCount !== null && (
          <div className="flex flex-col gap-1.5 rounded-[20px] border-[1.5px] border-line-soft bg-card p-5 transition-colors hover:border-cyan-deep">
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-mute">Public code repos</span>
            <span className="font-display text-[clamp(30px,4vw,44px)] font-black leading-none text-ink">{repoCount}</span>
            <p className="text-[14.5px] text-ink-soft">On GitHub, open for anyone to read.</p>
          </div>
        )}

        <div className="flex flex-col gap-1.5 rounded-[20px] border-[1.5px] border-line-soft bg-card p-5 transition-colors hover:border-cyan-deep">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-mute">Competition</span>
          <span className="font-display text-[clamp(30px,4vw,44px)] font-black leading-none text-amber">2024</span>
          <p className="text-[14.5px] text-ink-soft">Winner — software development competition.</p>
        </div>

        <div className="col-span-2 flex flex-col gap-1.5 rounded-[20px] border-[1.5px] border-line-soft bg-card p-5 transition-colors hover:border-cyan-deep">
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-ink-mute">Where &amp; how</span>
          <p className="text-base text-ink">
            <strong>Mirpur, Dhaka, Bangladesh.</strong>{' '}
            <span className="text-ink-soft">
              I work remotely for clients anywhere in the world, and I reply to messages within 24 hours.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default BentoSection;
