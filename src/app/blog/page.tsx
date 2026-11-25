import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublishedPosts,
  getPublishedPostCount,
  getCategories,
  getCategoryCounts,
  getFeaturedPost,
  getTagsForPostIds,
} from "@/lib/blog";
import LiveBlogList from "@/components/blog/LiveBlogList";

export const revalidate = 60; // ISR — 60 seconds for fast scheduled post publication

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Blog | Zahid Hasan Tonmoy - MERN, AI & Web Engineering",
  description:
    "Technical articles, in-depth tutorials, and architectural notes on MERN Stack, Next.js, TypeScript, AI Agents, Python Machine Learning, and Cloud Development by Zahid Hasan Tonmoy.",
  keywords: [
    "MERN Stack Tutorial",
    "Next.js 14",
    "React",
    "Node.js",
    "TypeScript",
    "AI Agent Development",
    "Python Machine Learning",
    "Zahid Hasan Tonmoy",
    "Software Engineering Blog",
    "Web Development Bangladesh"
  ],
  openGraph: {
    title: "Blog | Zahid Hasan Tonmoy - MERN, AI & Web Engineering",
    description: "Technical blog on MERN Stack, Next.js, AI Agents, Machine Learning, and Modern Web Architecture.",
    url: "https://zahidhasantonmoy.vercel.app/blog",
    type: "website",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zahid Hasan Tonmoy's Technical Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Zahid Hasan Tonmoy - MERN, AI & Web Engineering",
    description: "Technical blog on MERN Stack, Next.js, AI Agents, Machine Learning, and Modern Web Architecture.",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/blog",
    languages: {
      en: "https://zahidhasantonmoy.vercel.app/blog",
      bn: "https://zahidhasantonmoy.vercel.app/bn/blog",
    },
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; tag?: string; page?: string }>;
}) {
  const { category, search, tag, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const isFiltered = Boolean(category || search?.trim() || tag);

  // Server-side filtering + pagination: the DB owns category/search/tag/page,
  // so filtered URLs render correctly on first paint and without JS.
  const [posts, totalPosts, categories, categoryCounts, featured] = await Promise.all([
    getPublishedPosts({
      category,
      search,
      tag,
      limit: PAGE_SIZE,
      offset: (pageNum - 1) * PAGE_SIZE,
    }),
    getPublishedPostCount({ category, search, tag }),
    getCategories(),
    getCategoryCounts(),
    // Featured hero only on the unfiltered first page; null renders nothing.
    !isFiltered && pageNum === 1 ? getFeaturedPost() : Promise.resolve(null),
  ]);
  const postTags = await getTagsForPostIds(posts.map((p) => p.id));

  // Live total from the DB count query — never hardcoded, never the page length.
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));

  const featuredDate = featured?.published_at
    ? new Date(featured.published_at).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-[#060a13] text-[#eef4ff]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Zahid Hasan Tonmoy's Technical Blog",
            description: "Technical articles on MERN Stack, Next.js, TypeScript, AI Agents, and Machine Learning.",
            url: "https://zahidhasantonmoy.vercel.app/blog",
            isPartOf: {
              "@type": "WebSite",
              name: "Zahid Hasan Tonmoy's Portfolio",
              url: "https://zahidhasantonmoy.vercel.app"
            }
          })
        }}
      />
      <div className="max-w-[1220px] mx-auto px-[21px] md:px-[34px] pt-16 pb-20">
        {/* R4 section head */}
        <div>
          <span className="font-mono text-[13px] tracking-[0.12em] text-[#2fd8f2] uppercase">
            05 · Blog
          </span>
          <h1 className="font-['Unbounded',sans-serif] font-bold text-[clamp(27px,4.6vw,42px)] leading-[1.15] text-[#eef4ff] mt-3">
            My blog — {totalPosts} posts, mostly on how AI agents are built
          </h1>
          <p className="text-[#c3d2ea] text-[17.5px] max-w-[64ch] mt-4">
            I write to teach what I learn. The newest posts come with a
            one-line summary in simple words; all {totalPosts} are here —{" "}
            <strong className="text-[#eef4ff]">search or filter</strong> to
            find a topic. Also available in{" "}
            <Link
              href="/bn/blog"
              className="text-[#2fd8f2] hover:text-[#ffb02e] underline underline-offset-4 transition-colors"
            >
              বাংলা
            </Link>
            .
          </p>
        </div>

        {/* Featured post hero — real is_featured flag, no DB change.
            Renders nothing when no post is featured. */}
        {featured && (
          <section aria-label="Featured post" className="mt-10">
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-0 bg-[#0e1729] border-[1.5px] border-[#1a2947] rounded-[22px] overflow-hidden hover:border-[#0e7d99] transition-colors"
            >
              {featured.cover_image_url ? (
                <div className="h-56 md:h-full min-h-[220px] overflow-hidden bg-[#0a1120]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title_en}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="h-56 md:h-full min-h-[220px] bg-[#0a1120] border-b md:border-b-0 md:border-r-[1.5px] border-[#1a2947] flex items-center justify-center">
                  <span className="font-mono text-xs tracking-[0.12em] uppercase text-[#2fd8f2]">
                    {featured.categories?.name_en ?? "Blog"}
                  </span>
                </div>
              )}
              <div className="flex flex-col p-6 sm:p-8">
                <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#ffb02e]/10 border border-[#ffb02e]/40 text-[#ffb02e] font-mono text-[11px] tracking-[0.12em] uppercase mb-4">
                  ★ Featured
                </span>
                {featured.categories && (
                  <span className="font-mono text-[11px] text-[#2fd8f2] tracking-[0.07em] uppercase mb-2">
                    {featured.categories.name_en}
                  </span>
                )}
                <h2 className="font-['Unbounded',sans-serif] font-bold text-xl sm:text-2xl leading-[1.3] text-[#eef4ff] group-hover:text-[#2fd8f2] transition-colors mb-3">
                  {featured.title_en}
                </h2>
                {featured.excerpt_en && (
                  <p className="text-[15px] text-[#c3d2ea] leading-relaxed flex-1">
                    {featured.excerpt_en}
                  </p>
                )}
                <p className="font-mono text-xs text-[#a9bedd] mt-5">
                  {featuredDate}
                  {featuredDate ? " · " : ""}
                  {featured.read_time_min} min read
                </p>
              </div>
            </Link>
          </section>
        )}

        {/* Server-filtered search, category chips, tag chip & card grid */}
        <LiveBlogList
          initialPosts={posts}
          categories={categories}
          categoryCounts={categoryCounts}
          postTags={postTags}
          lang="en"
          initialCategory={category}
          initialSearch={search}
          initialTag={tag}
          totalCount={totalPosts}
          currentPage={pageNum}
          totalPages={totalPages}
          showPagination
          basePath="/blog"
        />

        {/* Journal CTA */}
        <div className="mt-16 p-6 bg-[#0e1729] rounded-[20px] border-[1.5px] border-[#1a2947] text-center">
          <p className="text-[#c3d2ea] mb-4">
            Looking for daily learning notes? Check my Development Journal.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 min-h-[52px] px-5 py-2.5 bg-[#0e1729] border-[1.5px] border-[#22345a] rounded-[14px] text-sm font-extrabold text-[#eef4ff] hover:border-[#2fd8f2] transition-colors"
          >
            View Dev Journal →
          </Link>
        </div>
      </div>
    </main>
  );
}
