import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from "@/lib/blog";
import ArticleContent from "@/components/blog/ArticleContent";
import RelatedPosts from "@/components/blog/RelatedPosts";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const base = "https://zahidhasantonmoy.vercel.app";
  const title = post.seo_title_en || post.title_en;
  const description = post.meta_desc_en || post.excerpt_en || "";

  return {
    title: `${title} | Zahid Hasan Tonmoy`,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/blog/${slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      authors: ["Zahid Hasan Tonmoy"],
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
    alternates: {
      canonical: `${base}/blog/${slug}`,
      languages: {
        en: `${base}/blog/${slug}`,
        ...(post.title_bn ? { bn: `${base}/bn/blog/${slug}` } : {}),
      },
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.category_id ?? null);

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // JSON-LD Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title_en,
    description: post.excerpt_en ?? "",
    image: post.cover_image_url ?? "",
    datePublished: post.published_at ?? "",
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: "Zahid Hasan Tonmoy",
      url: "https://zahidhasantonmoy.vercel.app",
    },
    publisher: {
      "@type": "Person",
      name: "Zahid Hasan Tonmoy",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://zahidhasantonmoy.vercel.app/blog/${slug}`,
    },
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <main className="min-h-screen bg-white dark:bg-gray-900">
        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt={post.title_en}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gray-700 dark:hover:text-gray-300">Blog</Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 truncate max-w-xs">{post.title_en}</span>
          </nav>

          {/* Category */}
          {post.categories && (
            <Link
              href={`/blog?category=${post.categories.slug}`}
              className="inline-block text-xs px-3 py-1 rounded-full text-white font-medium mb-4"
              style={{ backgroundColor: post.categories.color }}
            >
              {post.categories.name_en}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {post.title_en}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                Z
              </div>
              <span>Zahid Hasan Tonmoy</span>
            </div>
            {publishDate && <span>·</span>}
            {publishDate && <span>{publishDate}</span>}
            <span>·</span>
            <span>{post.read_time_min} min read</span>
            {post.title_bn && (
              <>
                <span>·</span>
                <Link
                  href={`/bn/blog/${slug}`}
                  className="text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                >
                  🇧🇩 বাংলায় পড়ুন
                </Link>
              </>
            )}
          </div>

          {/* Content */}
          <ArticleContent content={post.content_en ?? ""} />

          {/* Tags */}
          {post.post_tags && post.post_tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {post.post_tags.map(({ tags: tag }) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition"
                  >
                    #{tag.name_en}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Card */}
          <div className="mt-10 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                Z
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Zahid Hasan Tonmoy</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  MERN Full Stack Developer &amp; AI Agent Developer based in Dhaka, Bangladesh.
                  Writing about web development, Laravel, React, PostgreSQL and my learning journey.
                </p>
                <Link
                  href="/"
                  className="text-sm text-indigo-500 hover:text-indigo-400 mt-2 inline-block"
                >
                  View Portfolio →
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="max-w-5xl mx-auto px-4 pb-16">
            <RelatedPosts posts={related} />
          </section>
        )}
      </main>
    </>
  );
}
