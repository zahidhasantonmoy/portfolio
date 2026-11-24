'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProjectCardProps {
  title: string;
  description: string;
  images: string[];
  technologies: string[];
  liveUrl: string;
  githubUrl: string;
  category: string;
}

type LiveStatus = 'live' | 'offline' | 'code' | 'site';

/**
 * Demo status, verified with curl on 2026-11-24 (HEAD request, then a GET
 * content check where the HEAD code alone was misleading):
 * - Gold Price Predictor: connection fails entirely (Render app down) -> OFFLINE
 * - Halarnati / OffenseOrbit: HEAD returns 200, but the body is an
 *   InfinityFree "DNS Resolution Error" parking page -> OFFLINE
 * - Curious Cart BD: 200, real shop front page -> LIVE
 * - Jerseyvault: HEAD 302, GET lands on a Vercel "Login" wall -> OFFLINE
 * - Vortex Shield (protocolzero.vercel.app): 200, real app -> LIVE
 * - LocalDrop Pro (localdrop-one.vercel.app): 200, real app -> LIVE
 * - Flexpath / Smart Drainage: no demo URL in the data (code / main site only)
 * Titles not in this map fall back to: liveUrl -> live, githubUrl -> code,
 * otherwise -> site. Never invent a demo URL.
 */
const STATUS_BY_TITLE: Record<string, LiveStatus> = {
  flexpath: 'code',
  goldpricepredictor: 'offline',
  halarnati: 'offline',
  offenseorbit: 'offline',
  smartdrainagesystem: 'site',
  curiouscartbd: 'live',
  jerseyvault: 'offline',
  vortexshield: 'live',
  localdroppro: 'live',
};

/** Category label from the R4 design (falls back to the DB category). */
const CATEGORY_LABEL: Record<string, string> = {
  flexpath: 'Mobile app · Best work',
  goldpricepredictor: 'Data & AI · Best work',
  localdroppro: 'Website · Best work',
  jerseyvault: 'Online shop',
  vortexshield: 'Security tool',
  curiouscartbd: 'Online shop',
  smartdrainagesystem: 'IoT · Sensors',
  offenseorbit: 'Web platform',
  halarnati: 'File sharing',
};

/** Tall (object-center) screenshots, as in the design. */
const TALL_SHOT_TITLES = new Set(['flexpath', 'halarnati']);

interface ProjectDetail {
  problem: string;
  built: string;
  result: string;
  resultStrong?: string;
  steps: string[];
  why?: string;
}

/**
 * Problem / build / result copy and "How it works" steps — only for the
 * projects the R4 design itself documents. No steps exist in the DB, so any
 * project not listed here gets no details block (never invent steps).
 */
const DETAILS_BY_TITLE: Record<string, ProjectDetail> = {
  flexpath: {
    problem:
      'Small jobs are found through scattered chats and word of mouth. There is no one trusted place to find work or to hire.',
    built:
      'A mobile app with three parts — job seekers, employers, admins. Users prove who they are with their national ID card, chat inside the app, and rate each other after a job.',
    result:
      'A complete working app: find a job, prove your ID, chat, get hired. The full code is public. ',
    resultStrong: 'User numbers and income: not published yet — I will not make up figures.',
    steps: [
      'A job seeker makes a profile and sends a photo of their national ID.',
      'An admin checks the ID. Only approved profiles are marked trusted.',
      'An employer posts a job with a budget. Seekers search and filter the list.',
      'The seeker applies, and both sides chat inside the app while the work happens.',
      'After the job, both sides give ratings and reviews.',
    ],
    why: 'trust is the whole product, so ID checking and chat sit at the heart of the app — not added later. And it is mobile-first, because the users live on their phones.',
  },
  goldpricepredictor: {
    problem:
      'Gold prices move every day, and everyone claims their method works. Nobody had tested them fairly, side by side.',
    built:
      'I tested more than 15 prediction methods on the same past data, fairly, and picked the winner — then put it in a small web app: type in today\u2019s numbers, get a prediction right away, save it to a file.',
    result: 'The winning method (',
    resultStrong: 'Huber Regressor) scored R² ≈ 0.9999 on past data — almost perfect. In simple words: on old data, its guesses were nearly exact.',
    steps: [
      'Take past gold prices: opening, highest, lowest, closing, and how much was traded.',
      'Clean the data and put all numbers on the same scale.',
      'Train 15+ methods on the same data — Linear, Ridge, Lasso, Random Forest, Gradient Boosting, Huber and more — and score them all the same way.',
      'Huber Regressor won, because it stays calm on strange, jumpy days when other methods get confused.',
      'The web app: enter the day\u2019s numbers, choose a method, get an instant prediction, save it as CSV.',
    ],
    why: 'I did not pick a favourite method first and then prove it right. I let all of them compete on the same data — the honest way to choose.',
  },
  localdroppro: {
    problem:
      'Sending a file to the device beside you usually means uploading it to some company\u2019s server first — slow, and not private.',
    built:
      'A website that sends files directly from one device to another. Two devices connect with a simple 6-digit code or a QR scan, and files are locked with strong encryption while they travel.',
    result: 'Live and free to try in your browser today — open it on two devices and test it yourself. ',
    resultStrong: 'Download and user counts: not published yet.',
    steps: [
      'Open the site on two devices, side by side.',
      'Pair them with a 6-digit code or a QR scan — takes seconds.',
      'Pick any file — any type, any size. Folders are zipped automatically. Files travel directly between the two devices.',
      'Watch the progress bar. Pause, resume or cancel — with built-in chat and a history of past transfers.',
    ],
  },
};

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const ProjectCard = ({ title, description, images, technologies, liveUrl, githubUrl, category }: ProjectCardProps) => {
  const [howOpen, setHowOpen] = useState(false);
  const key = normalizeTitle(title);
  const detail = DETAILS_BY_TITLE[key];
  const status: LiveStatus =
    STATUS_BY_TITLE[key] ?? (liveUrl ? 'live' : githubUrl ? 'code' : 'site');
  const categoryLabel = CATEGORY_LABEL[key] || category || 'Project';
  const tallShot = TALL_SHOT_TITLES.has(key);
  const image = images && images.length > 0 ? images[0] : null;

  const pill =
    status === 'live' ? (
      <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-[rgba(4,10,20,0.82)] px-[11px] py-[5px] font-mono text-xs font-semibold text-[#8df5bb]">
        ● LIVE — TRY IT
      </span>
    ) : status === 'code' ? (
      <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-[rgba(4,10,20,0.82)] px-[11px] py-[5px] font-mono text-xs font-semibold text-[#d9f6ff]">
        CODE PUBLIC
      </span>
    ) : status === 'site' ? (
      <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-[rgba(4,10,20,0.82)] px-[11px] py-[5px] font-mono text-xs font-semibold text-[#d9f6ff]">
        ON MY MAIN SITE
      </span>
    ) : (
      <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-[rgba(4,10,20,0.82)] px-[11px] py-[5px] font-mono text-xs font-semibold text-[#d9f6ff]">
        DEMO OFFLINE
      </span>
    );

  return (
    <article className="flex flex-col overflow-hidden rounded-[22px] border-[1.5px] border-line-soft bg-card transition-colors hover:border-cyan-deep">
      <div className="relative">
        {image ? (
          <div className="relative h-[230px] w-full overflow-hidden">
            <Image
              src={image}
              alt={`${title} — screenshot`}
              fill
              sizes="(max-width: 820px) 100vw, 50vw"
              loading="lazy"
              className={tallShot ? 'object-cover object-center' : 'object-cover object-top'}
            />
          </div>
        ) : (
          <div className="h-[230px] w-full bg-card2" aria-hidden="true" />
        )}
        {pill}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <span className="font-mono text-xs uppercase tracking-[0.1em] text-cyan">{categoryLabel}</span>
        <h3 className="text-[23px] font-extrabold leading-[1.15]">{title}</h3>
        <p className="text-base text-ink-soft">{description}</p>

        {detail && (
          <div className="mt-0.5 grid gap-[9px]">
            <div className="border-l-[3px] border-line pl-[13px]">
              <h4 className="mb-0.5 font-mono text-[12.5px] uppercase tracking-[0.08em] text-ink-mute">
                The problem
              </h4>
              <p className="text-[15px] text-ink-soft">{detail.problem}</p>
            </div>
            <div className="border-l-[3px] border-line pl-[13px]">
              <h4 className="mb-0.5 font-mono text-[12.5px] uppercase tracking-[0.08em] text-ink-mute">
                What I built
              </h4>
              <p className="text-[15px] text-ink-soft">{detail.built}</p>
            </div>
            <div className="border-l-[3px] border-amber pl-[13px]">
              <h4 className="mb-0.5 font-mono text-[12.5px] uppercase tracking-[0.08em] text-ink-mute">
                The result
              </h4>
              <p className="text-[15px] text-ink-soft">
                {detail.result}
                {detail.resultStrong && <strong className="text-ink">{detail.resultStrong}</strong>}
              </p>
            </div>
          </div>
        )}

        {technologies.length > 0 && (
          <ul className="mt-0.5 flex list-none flex-wrap gap-[7px]">
            {technologies.map((tech) => (
              <li
                key={tech}
                className="rounded-full border-[1.5px] border-line px-[11px] py-1 font-mono text-[12.5px] text-ink-soft"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-2">
          {status === 'live' && liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center rounded-xl border-2 border-cyan bg-cyan px-[18px] py-[9px] text-[15px] font-extrabold text-[#04121a] shadow-[0_8px_22px_rgba(47,216,242,0.22)] transition-colors hover:border-amber hover:bg-amber hover:text-amber-ink"
            >
              Try it live ↗
            </a>
          )}
          {status === 'code' && githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center rounded-xl border-2 border-cyan bg-cyan px-[18px] py-[9px] text-[15px] font-extrabold text-[#04121a] shadow-[0_8px_22px_rgba(47,216,242,0.22)] transition-colors hover:border-amber hover:bg-amber hover:text-amber-ink"
            >
              See the code ↗
            </a>
          )}
          {status === 'site' && (
            <a
              href="https://zahidhasantonmoy.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center rounded-xl border-2 border-line px-[18px] py-[9px] text-[15px] font-extrabold text-ink transition-colors hover:border-cyan hover:text-cyan"
            >
              See it on my site ↗
            </a>
          )}
          {status === 'offline' && (
            <span className="inline-flex min-h-[46px] items-center rounded-xl border-2 border-dashed border-line bg-bg2 px-4 py-[9px] text-[14.5px] text-ink-mute">
              Live demo is offline right now
            </span>
          )}
          {status === 'live' && githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center rounded-xl border-2 border-line px-[18px] py-[9px] text-[15px] font-extrabold text-ink transition-colors hover:border-cyan hover:text-cyan"
            >
              Code ↗
            </a>
          )}
        </div>

        {detail && (
          <div className="mt-1 border-t border-dashed border-line pt-2.5">
            <button
              type="button"
              onClick={() => setHowOpen((open) => !open)}
              aria-expanded={howOpen}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 text-[15px] font-extrabold text-ink"
            >
              <span
                className="text-[21px] font-black leading-none text-amber transition-transform duration-200"
                style={{ transform: howOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                aria-hidden="true"
              >
                +
              </span>
              How it works, step by step
            </button>
            {howOpen && (
              <div>
                <ol className="mb-2 ml-5 mt-1 grid gap-1.5 text-[15px] text-ink-soft">
                  {detail.steps.map((step, i) => (
                    <li key={i} className="list-decimal">
                      {step}
                    </li>
                  ))}
                </ol>
                {detail.why && (
                  <p className="text-[15px] text-ink-soft">
                    <strong className="text-ink">Why this way:</strong> {detail.why}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
