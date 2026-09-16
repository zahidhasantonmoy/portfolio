import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPostBySlug } from "@/lib/blog";
import ArticleContent from "@/components/blog/ArticleContent";
import ShareButtons from "@/components/blog/ShareButtons";
import { FaRegClock, FaRegCalendarAlt } from "react-icons/fa";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.title_bn) return { title: "পোস্ট পাওয়া যায়নি" };

  const base = "https://zahidhasantonmoy.vercel.app";
  const title = post.seo_title_bn || post.title_bn;
  const description = post.meta_desc_bn || post.excerpt_bn || "";

  return {
    title: `${title} | জাহিদ হাসান তন্ময়`,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/bn/blog/${slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
    alternates: {
      canonical: `${base}/bn/blog/${slug}`,
      languages: {
        bn: `${base}/bn/blog/${slug}`,
        en: `${base}/blog/${slug}`,
      },
    },
  };
}

export default async function BnBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.title_bn) notFound();

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("bn-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // Bengali JSON-LD schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title_bn,
    description: post.excerpt_bn ?? "",
    datePublished: post.published_at ?? "",
    author: { "@type": "Person", name: "জাহিদ হাসান তন্ময়" },
    inLanguage: "bn",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://zahidhasantonmoy.vercel.app/bn/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        {/* Premium Hero Section */}
        <div className="relative w-full h-[60vh] min-h-[400px] flex items-end justify-center overflow-hidden">
          {post.cover_image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt={post.title_bn}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900"></div>
          )}
          
          <div className="relative z-10 max-w-4xl w-full px-6 pb-16 mx-auto text-center">
            {/* Category */}
            {post.categories && (
              <Link
                href={`/bn/blog?category=${post.categories.slug}`}
                className="inline-block text-xs px-4 py-1.5 rounded-full text-white font-semibold mb-6 shadow-lg backdrop-blur-md bg-white/20 border border-white/30 transition-transform hover:scale-105"
                style={{ backgroundColor: post.categories.color ? `${post.categories.color}cc` : undefined }}
              >
                {post.categories.name_bn || post.categories.name_en}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-md">
              {post.title_bn}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-200 font-medium">
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  Z
                </div>
                <span>জাহিদ হাসান তন্ময়</span>
              </div>
              
              {publishDate && (
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                  <FaRegCalendarAlt className="opacity-80" />
                  <span>{publishDate}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <FaRegClock className="opacity-80" />
                <span>{post.read_time_min} মিনিটের পড়া</span>
              </div>

              <Link
                href={`/blog/${slug}`}
                className="flex items-center gap-1.5 bg-indigo-600/80 hover:bg-indigo-500 px-4 py-1.5 rounded-full backdrop-blur-sm border border-indigo-400/30 text-white transition-colors shadow-lg"
              >
                🇬🇧 Read in English
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section with Sidebar */}
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-10 relative">
          
          {/* Share Sidebar */}
          <aside className="hidden md:flex flex-col w-16 flex-shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
            <ShareButtons title={post.title_bn} />
          </aside>

          {/* Main Article Content */}
          <article className="flex-1 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-12 -mt-24 relative z-20">
            {/* Desktop Breadcrumb */}
            <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 mb-10">
              <Link href="/bn" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">হোম</Link>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <Link href="/bn/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">ব্লগ</Link>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              <span className="text-gray-800 dark:text-gray-200 truncate">{post.title_bn}</span>
            </nav>

            <div className="prose dark:prose-invert max-w-none prose-lg prose-indigo prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500">
              <ArticleContent content={post.content_bn ?? ""} />
            </div>

            {/* Mobile Share Buttons */}
            <div className="md:hidden mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 text-center">শেয়ার করুন</h3>
              <div className="flex justify-center">
                <div className="flex flex-row gap-3">
                  <ShareButtons title={post.title_bn} />
                </div>
              </div>
            </div>
            
            {/* Premium Author Card */}
            <div className="mt-12 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg ring-4 ring-white dark:ring-gray-900 flex-shrink-0">
                  Z
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">জাহিদ হাসান তন্ময়</p>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1 mb-3 uppercase tracking-wide">সফটওয়্যার ডেভেলপার</p>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    MERN ফুল-স্ট্যাক ডেভেলপার এবং AI এজেন্ট ডেভেলপার, ঢাকা, বাংলাদেশ।
                    ওয়েব ডেভেলপমেন্ট, রিঅ্যাক্ট, লারাভেল এবং আমার লার্নিং জার্নি নিয়ে লিখছি।
                  </p>
                  <Link
                    href="/bn"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-all shadow-sm group"
                  >
                    পোর্টফোলিও দেখুন 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
              <Link href="/bn/blog" className="text-sm font-medium text-indigo-500 hover:text-indigo-400 transition flex items-center gap-2">
                ← সকল পোস্টে ফিরে যান
              </Link>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
