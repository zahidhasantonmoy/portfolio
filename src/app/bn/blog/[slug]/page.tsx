import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPostBySlug } from "@/lib/blog";
import ArticleContent from "@/components/blog/ArticleContent";

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
    title: `${title} | জাহিদ হাসান টনময়`,
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
    author: { "@type": "Person", name: "জাহিদ হাসান টনময়" },
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
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">হোম</Link>
            <span>/</span>
            <Link href="/bn/blog" className="hover:text-gray-700 dark:hover:text-gray-300">ব্লগ</Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 truncate max-w-xs">{post.title_bn}</span>
          </nav>

          {/* Category */}
          {post.categories && (
            <span
              className="inline-block text-xs px-3 py-1 rounded-full text-white font-medium mb-4"
              style={{ backgroundColor: post.categories.color }}
            >
              {post.categories.name_bn || post.categories.name_en}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title_bn}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <span>জাহিদ হাসান টনময়</span>
            {publishDate && <><span>·</span><span>{publishDate}</span></>}
            <span>·</span>
            <span>{post.read_time_min} মিনিটের পড়া</span>
            <span>·</span>
            <Link href={`/blog/${slug}`} className="text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
              🇬🇧 Read in English
            </Link>
          </div>

          {/* Bangla Content */}
          <ArticleContent content={post.content_bn ?? ""} />

          {/* Back */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/bn/blog" className="text-sm text-indigo-500 hover:text-indigo-400 transition">
              ← সকল পোস্ট
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
