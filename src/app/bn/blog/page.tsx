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

export const revalidate = 60; // ISR — 60 seconds

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "বাংলা টেক ব্লগ | জাহিদ হাসান তন্ময় - MERN ও AI ইঞ্জিনিয়ারিং",
  description:
    "MERN স্ট্যাক, Next.js, React, TypeScript, পাইথন মেশিন লার্নিং ও এআই এজেন্ট ডেভেলপমেন্ট সহ আধুনিক ওয়েব প্রযুক্তির উপর বাংলায় গভীর টেকনিক্যাল আর্টিকেল ও টিউটোরিয়াল।",
  keywords: [
    "বাংলা ব্লগ",
    "প্রোগ্রামিং টিউটোরিয়াল বাংলা",
    "MERN Stack Bangla",
    "Next.js Bangla Tutorial",
    "React বাংলা",
    "মেশিন লার্নিং বাংলা",
    "জাহিদ হাসান তন্ময়",
    "ওয়েব ডেভেলপমেন্ট বাংলাদেশ"
  ],
  openGraph: {
    title: "বাংলা টেক ব্লগ | জাহিদ হাসান তন্ময় - MERN ও AI ইঞ্জিনিয়ারিং",
    description: "MERN স্ট্যাক, Next.js, React, TypeScript, পাইথন মেশিন লার্নিং ও এআই এজেন্ট ডেভেলপমেন্ট সহ আধুনিক ওয়েব প্রযুক্তির উপর বাংলায় টেকনিক্যাল আর্টিকেল।",
    url: "https://zahidhasantonmoy.vercel.app/bn/blog",
    type: "website",
    locale: "bn_BD",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "জাহিদ হাসান তন্ময় — বাংলা টেক ব্লগ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "বাংলা টেক ব্লগ | জাহিদ হাসান তন্ময় - MERN ও AI ইঞ্জিনিয়ারিং",
    description: "MERN স্ট্যাক, Next.js, React, TypeScript, মেশিন লার্নিং ও এআই এজেন্ট ডেভেলপমেন্টের উপর বাংলায় টেকনিক্যাল আর্টিকেল।",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/bn/blog",
    languages: {
      bn: "https://zahidhasantonmoy.vercel.app/bn/blog",
      en: "https://zahidhasantonmoy.vercel.app/blog",
    },
  },
};

export default async function BnBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; tag?: string; page?: string }>;
}) {
  const { category, search, tag, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const isFiltered = Boolean(category || search?.trim() || tag);

  // Server-side filtering + pagination (BN-only posts), same as the EN page.
  const [posts, totalPosts, categories, categoryCounts, featured] = await Promise.all([
    getPublishedPosts({
      category,
      search,
      tag,
      bnOnly: true,
      limit: PAGE_SIZE,
      offset: (pageNum - 1) * PAGE_SIZE,
    }),
    getPublishedPostCount({ category, search, tag, bnOnly: true }),
    getCategories(),
    getCategoryCounts({ bnOnly: true }),
    // Featured hero only on the unfiltered first page; null renders nothing.
    !isFiltered && pageNum === 1 ? getFeaturedPost({ bnOnly: true }) : Promise.resolve(null),
  ]);
  const postTags = await getTagsForPostIds(posts.map((p) => p.id));

  // Live total from the DB count query — never hardcoded, never the page length.
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));

  const featuredTitle = featured?.title_bn ?? featured?.title_en;
  const featuredExcerpt = featured?.excerpt_bn ?? featured?.excerpt_en;
  const featuredDate = featured?.published_at
    ? new Date(featured.published_at).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-[#060a13] text-[#eef4ff]" lang="bn">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "জাহিদ হাসান তন্ময়ের বাংলা টেক ব্লগ",
            description: "MERN স্ট্যাক, Next.js, TypeScript, এআই এজেন্ট ও মেশিন লার্নিং নিয়ে বাংলায় টেকনিক্যাল আর্টিকেল।",
            url: "https://zahidhasantonmoy.vercel.app/bn/blog",
            inLanguage: "bn",
            isPartOf: {
              "@type": "WebSite",
              name: "জাহিদ হাসান তন্ময়ের পোর্টফোলিও",
              url: "https://zahidhasantonmoy.vercel.app"
            }
          })
        }}
      />
      <div className="max-w-[1220px] mx-auto px-[21px] md:px-[34px] pt-16 pb-20">
        {/* R4 section head */}
        <div>
          <span className="font-mono text-[13px] tracking-[0.12em] text-[#2fd8f2] uppercase">
            ০৫ · ব্লগ
          </span>
          <h1 className="font-['Unbounded',sans-serif] font-bold text-[clamp(27px,4.6vw,42px)] leading-[1.15] text-[#eef4ff] mt-3">
            আমার ব্লগ — {totalPosts}টি পোস্ট, বেশিরভাগই এআই এজেন্ট কীভাবে বানানো হয় তা নিয়ে
          </h1>
          <p className="text-[#c3d2ea] text-[17.5px] max-w-[64ch] mt-4">
            যা শিখি, তা শেখাতেই লিখি। নতুন পোস্টগুলোতে সহজ ভাষায় এক লাইনের
            সারাংশ আছে; সব {totalPosts}টি পোস্ট এখানেই আছে — টপিক খুঁজতে{" "}
            <strong className="text-[#eef4ff]">সার্চ বা ফিল্টার</strong> করুন।
          </p>
          <Link
            href="/blog"
            className="inline-block mt-4 text-sm text-[#2fd8f2] hover:text-[#ffb02e] underline underline-offset-4 transition-colors"
          >
            Read in English →
          </Link>
        </div>

        {/* Featured post hero — real is_featured flag, no DB change.
            Renders nothing when no post is featured. */}
        {featured && featuredTitle && (
          <section aria-label="বিশেষ পোস্ট" className="mt-10">
            <Link
              href={`/bn/blog/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-0 bg-[#0e1729] border-[1.5px] border-[#1a2947] rounded-[22px] overflow-hidden hover:border-[#0e7d99] transition-colors"
            >
              {featured.cover_image_url ? (
                <div className="h-56 md:h-full min-h-[220px] overflow-hidden bg-[#0a1120]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.cover_image_url}
                    alt={featuredTitle}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="h-56 md:h-full min-h-[220px] bg-[#0a1120] border-b md:border-b-0 md:border-r-[1.5px] border-[#1a2947] flex items-center justify-center">
                  <span className="font-mono text-xs tracking-[0.12em] uppercase text-[#2fd8f2]">
                    {featured.categories?.name_bn ?? featured.categories?.name_en ?? "ব্লগ"}
                  </span>
                </div>
              )}
              <div className="flex flex-col p-6 sm:p-8">
                <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#ffb02e]/10 border border-[#ffb02e]/40 text-[#ffb02e] font-mono text-[11px] tracking-[0.12em] uppercase mb-4">
                  ★ বিশেষ পোস্ট
                </span>
                {featured.categories && (
                  <span className="font-mono text-[11px] text-[#2fd8f2] tracking-[0.07em] uppercase mb-2">
                    {featured.categories.name_bn || featured.categories.name_en}
                  </span>
                )}
                <h2 className="font-bold text-xl sm:text-2xl leading-[1.3] text-[#eef4ff] group-hover:text-[#2fd8f2] transition-colors mb-3">
                  {featuredTitle}
                </h2>
                {featuredExcerpt && (
                  <p className="text-[15px] text-[#c3d2ea] leading-relaxed flex-1">
                    {featuredExcerpt}
                  </p>
                )}
                <p className="font-mono text-xs text-[#a9bedd] mt-5">
                  {featuredDate}
                  {featuredDate ? " · " : ""}
                  {featured.read_time_min} মিনিটের পড়া
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
          lang="bn"
          initialCategory={category}
          initialSearch={search}
          initialTag={tag}
          totalCount={totalPosts}
          currentPage={pageNum}
          totalPages={totalPages}
          showPagination
          basePath="/bn/blog"
        />
      </div>
    </main>
  );
}
