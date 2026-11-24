"use client";
import React, { useEffect, useMemo, useState } from "react";

interface GitHubUser {
  public_repos: number;
  followers: number;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  language: string | null;
  pushed_at: string;
  stargazers_count: number;
  html_url: string;
}

interface ContributionStats {
  totalContributions?: number;
  lastUpdated?: string;
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatFetchDate(iso: string | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

const GitHubSection = () => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[] | null>(null);
  const [contrib, setContrib] = useState<ContributionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [statsRes, userRes, reposRes] = await Promise.all([
          fetch("/api/github-stats").catch(() => null),
          fetch("https://api.github.com/users/zahidhasantonmoy").catch(() => null),
          fetch("https://api.github.com/users/zahidhasantonmoy/repos?per_page=100&sort=updated").catch(() => null),
        ]);
        if (!isMounted) return;
        if (statsRes && statsRes.ok) {
          const data = (await statsRes.json()) as ContributionStats;
          setContrib(data);
        }
        if (userRes && userRes.ok) {
          setUser((await userRes.json()) as GitHubUser);
        }
        if (reposRes && reposRes.ok) {
          const data = (await reposRes.json()) as GitHubRepo[];
          if (Array.isArray(data)) setRepos(data);
        }
        if ((!userRes || !userRes.ok) && (!reposRes || !reposRes.ok)) {
          setFailed(true);
        }
      } catch {
        if (isMounted) setFailed(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const languages = useMemo(() => {
    if (!repos) return [];
    const counts = new Map<string, number>();
    repos.forEach((r) => {
      if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [repos]);

  const recentRepos = useMemo(() => {
    if (!repos) return [];
    return [...repos]
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, 7);
  }, [repos]);

  const lastPush = recentRepos.length > 0 ? recentRepos[0] : null;
  const totalStars = repos ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0) : null;

  return (
    <div id="github" className="mt-[70px] border-y-[1.5px] border-line-soft bg-bg2 py-14">
      <div className="wrap">
        <div className="sec-head">
          <span className="sec-tag">06 · GitHub</span>
          <h2>My code, in plain numbers</h2>
          <p>Nothing dressed up — exactly as the profile shows.</p>
        </div>

        {isLoading ? (
          <div className="mt-[26px] grid grid-cols-2 gap-3.5 lg:grid-cols-4" aria-label="Loading GitHub numbers">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[130px] animate-pulse rounded-[18px] border-[1.5px] border-line-soft bg-card" />
            ))}
          </div>
        ) : failed ? (
          <p className="mt-[26px] text-ink-soft">
            GitHub numbers could not be loaded just now — see them live on{' '}
            <a
              className="font-extrabold text-cyan hover:underline"
              href="https://github.com/zahidhasantonmoy?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/zahidhasantonmoy
            </a>
            .
          </p>
        ) : (
          <>
            <div className="mt-[26px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
              <div className="rounded-[18px] border-[1.5px] border-line-soft bg-card p-5">
                <div className="font-display text-[clamp(30px,4.4vw,44px)] font-black leading-[1.05] text-ink">
                  {user ? user.public_repos : '—'}
                </div>
                <p className="mt-[7px] text-sm text-ink-mute">
                  public code projects (called “repos”) on my profile
                </p>
              </div>
              <div className="rounded-[18px] border-[1.5px] border-line-soft bg-card p-5">
                <div className="font-display text-[clamp(30px,4.4vw,44px)] font-black leading-[1.05] text-ink">
                  {languages.length > 0 ? languages.length : '—'}
                </div>
                <p className="mt-[7px] text-sm text-ink-mute">programming languages used across those projects</p>
              </div>
              <div className="rounded-[18px] border-[1.5px] border-line-soft bg-card p-5">
                <div className="pt-2 font-display text-[clamp(19px,2.6vw,25px)] font-black leading-[1.05] text-ink">
                  {lastPush ? formatDay(lastPush.pushed_at) : '—'}
                </div>
                <p className="mt-[7px] text-sm text-ink-mute">
                  my most recent day of coding in public
                  {lastPush ? ` — on the ${lastPush.name} project` : ''}
                </p>
              </div>
              <div className="rounded-[18px] border-[1.5px] border-line-soft bg-card p-5">
                <div className="pt-2 font-display text-[clamp(19px,2.6vw,25px)] font-black leading-[1.05] text-ink">
                  {user ? formatDay(user.created_at) : '—'}
                </div>
                <p className="mt-[7px] text-sm text-ink-mute">
                  on GitHub since this date
                  {user ? ` · Followers: ${user.followers} · Stars: ${totalStars ?? '—'}` : ''} — exactly as the
                  profile shows
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-[26px] lg:grid-cols-2 lg:gap-10">
              <div>
                <h3 className="mb-3 font-mono text-[12.5px] uppercase tracking-[0.09em] text-amber">
                  Languages I have used — by each project&apos;s main language
                </h3>
                {languages.length > 0 ? (
                  <ul className="flex list-none flex-wrap gap-2">
                    {languages.map(([lang, count]) => (
                      <li
                        key={lang}
                        className="rounded-full border-[1.5px] border-line bg-card px-[13px] py-[6px] text-[14.5px] font-semibold"
                      >
                        {lang} <b className="ml-[5px] font-mono font-normal text-cyan">×{count}</b>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-mute">Language list could not be loaded just now.</p>
                )}
              </div>
              <div>
                <h3 className="mb-3 font-mono text-[12.5px] uppercase tracking-[0.09em] text-amber">
                  What I worked on recently
                </h3>
                {recentRepos.length > 0 ? (
                  <ul className="list-none">
                    {recentRepos.map((repo) => (
                      <li
                        key={repo.name}
                        className="flex justify-between gap-[14px] border-b border-line-soft px-0.5 py-[10px] text-[15.5px]"
                      >
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:text-cyan"
                        >
                          {repo.name}
                        </a>
                        <span className="whitespace-nowrap font-mono text-xs text-ink-mute">
                          {repo.language ? `${repo.language} · ` : ''}
                          {formatDay(repo.pushed_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-mute">Recent repos could not be loaded just now.</p>
                )}
              </div>
            </div>

            <a
              href="https://github.com/zahidhasantonmoy?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[50px] items-center rounded-[13px] border-2 border-line bg-card px-[22px] py-[11px] font-extrabold text-ink transition-colors hover:border-cyan hover:text-cyan"
            >
              See all {user ? user.public_repos : ''} repositories on GitHub ↗
            </a>
            <p className="mt-[18px] font-mono text-[13px] text-ink-mute">
              NUMBERS TAKEN FROM GITHUB ON {formatFetchDate(contrib?.lastUpdated)}.
              {contrib && typeof contrib.totalContributions === 'number'
                ? ` ${contrib.totalContributions.toLocaleString()} contributions in the last year.`
                : ''}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubSection;
