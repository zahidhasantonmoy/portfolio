import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FaRegCalendarAlt, FaRegClock, FaGithub, FaLinkedin, FaMedium, FaDev, FaCoffee } from "react-icons/fa";
import Link from "next/link";
import { getPostBySlug, getRelatedPosts, getAllPostSlugs, getAdjacentPosts, extractFaqsFromMarkdown, generateFaqSchema } from "@/lib/blog";
import ArticleContent from "@/components/blog/ArticleContent";
import ArticleCTA from "@/components/blog/ArticleCTA";
import RelatedPosts from "@/components/blog/RelatedPosts";
import BlogInteractions from "@/components/blog/BlogInteractions";
import TableOfContents from "@/components/blog/TableOfContents";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import PostNavigation from "@/components/blog/PostNavigation";
import ArticleAudioPlayer from "@/components/blog/ArticleAudioPlayer";
import ArticleFloatingBar from "@/components/blog/ArticleFloatingBar";
import AuthorMiniCard from "@/components/blog/AuthorMiniCard";
import SidebarRelatedPosts from "@/components/blog/SidebarRelatedPosts";
import { BlogReaderProvider } from "@/components/blog/BlogReaderContext";

export const revalidate = 60; // ISR — 60 seconds

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
        : [{ url: `${base}/blog/${slug}/opengraph-image`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : [`${base}/blog/${slug}/opengraph-image`],
    },
    alternates: {
      canonical: `${base}/blog/${slug}`,
      languages: {
        en: `${base}/blog/${slug}`,
        ...(post.title_bn ? { bn: `${base}/bn/blog/${slug}` } : {}),
        "x-default": `${base}/blog/${slug}`,
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

  const [related, adjacent] = await Promise.all([
    getRelatedPosts(post.id, post.category_id ?? null),
    getAdjacentPosts(post.id, post.published_at),
  ]);

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const wordCount = post.content_en ? post.content_en.trim().split(/\s+/).length : 0;

  // JSON-LD BreadcrumbList schema for rich Google search breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://zahidhasantonmoy.vercel.app",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://zahidhasantonmoy.vercel.app/blog",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title_en,
        "item": `https://zahidhasantonmoy.vercel.app/blog/${slug}`,
      },
    ],
  };

  // JSON-LD Article schema (E-E-A-T linked with Author #person entity)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `https://zahidhasantonmoy.vercel.app/blog/${slug}#article`,
    headline: post.title_en,
    name: post.title_en,
    description: post.meta_desc_en || post.excerpt_en || "",
    image: post.cover_image_url
      ? {
          "@type": "ImageObject",
          url: post.cover_image_url,
          width: 1280,
          height: 720,
          caption: post.title_en,
          representativeOfPage: true,
        }
      : {
          "@type": "ImageObject",
          url: `https://zahidhasantonmoy.vercel.app/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          caption: post.title_en,
        },
    datePublished: post.published_at || new Date().toISOString(),
    dateModified: post.updated_at || post.published_at || new Date().toISOString(),
    wordCount: wordCount,
    timeRequired: `PT${post.read_time_min || Math.max(1, Math.ceil(wordCount / 200))}M`,
    inLanguage: "en",
    author: {
      "@type": "Person",
      "@id": "https://zahidhasantonmoy.vercel.app/#person",
      name: "Zahid Hasan Tonmoy",
      url: "https://zahidhasantonmoy.vercel.app",
      jobTitle: "MERN Full Stack Developer & AI Agent Developer",
      sameAs: [
        "https://github.com/zahidhasantonmoy",
        "https://www.linkedin.com/in/zahidhasantonmoy/",
        "https://dev.to/zahidhasantonmoy",
        "https://medium.com/@zahidhasantonmoy",
      ],
    },
    publisher: {
      "@type": "Person",
      "@id": "https://zahidhasantonmoy.vercel.app/#person",
      name: "Zahid Hasan Tonmoy",
      logo: {
        "@type": "ImageObject",
        url: "https://zahidhasantonmoy.vercel.app/images/profile.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://zahidhasantonmoy.vercel.app/blog/${slug}`,
    },
    keywords: post.categories?.name_en
      ? [post.categories.name_en, "MERN", "Web Development", "AI", "Zahid Hasan Tonmoy"]
      : ["Web Development", "Zahid Hasan Tonmoy"],
  };

  const faqs = extractFaqsFromMarkdown(post.content_en ?? "");
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main className="min-h-screen bg-[#060a13] text-[#eef4ff]">
        {/* Premium Hero Section */}
        <div className="relative w-full h-[60vh] min-h-[400px] flex items-end justify-center overflow-hidden">
          {post.cover_image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image_url}
                alt={post.title_en}
                title={post.title_en}
                width={1280}
                height={720}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                itemProp="image"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1120] to-[#0e1729]"></div>
          )}
          
          <div className="relative z-10 max-w-4xl w-full px-6 pb-16 mx-auto text-center">
            {/* Category */}
            {post.categories && (
              <Link
                href={`/blog?category=${post.categories.slug}`}
                className="inline-block font-mono text-[11px] tracking-[0.07em] uppercase px-4 py-1.5 rounded-full text-[#2fd8f2] font-semibold mb-6 bg-black/40 backdrop-blur-md border border-white/20 transition-colors hover:border-[#2fd8f2]"
              >
                {post.categories.name_en}
              </Link>
            )}

            {/* Title */}
            <h1 className="font-['Unbounded',sans-serif] font-bold text-2xl sm:text-4xl md:text-5xl lg:text-[52px] leading-[1.15] text-white mb-6 drop-shadow-md">
              {post.title_en}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-200 font-medium">
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <div className="w-6 h-6 rounded-full bg-[#ffb02e] flex items-center justify-center text-[#1a1200] text-xs font-bold shadow-inner">
                  Z
                </div>
                <span>Zahid Hasan Tonmoy</span>
              </div>
              
              {publishDate && (
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                  <FaRegCalendarAlt className="opacity-80" />
                  <span>{publishDate}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <FaRegClock className="opacity-80" />
                <span>{post.read_time_min} min read</span>
              </div>

              {post.title_bn && (
                <Link
                  href={`/bn/blog/${slug}`}
                  className="flex items-center gap-1.5 bg-[#ffb02e] hover:bg-[#2fd8f2] px-4 py-1.5 rounded-full backdrop-blur-sm text-[#1a1200] font-extrabold transition-colors"
                >
                  🇧🇩 বাংলায় পড়ুন
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content Section with 3-Column Layout */}
        <BlogReaderProvider slug={slug}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-6 xl:gap-10 relative justify-center items-start">
            
            {/* Left Interactive Floating Bar (Sticky on desktop, Bottom Bar on mobile) */}
            <ArticleFloatingBar title={post.title_en} lang="en" />

            {/* Main Article Content */}
            <article className="flex-1 max-w-4xl min-w-0 w-full bg-[#0e1729] rounded-[22px] border-[1.5px] border-[#1a2947] p-6 sm:p-8 md:p-12 -mt-20 sm:-mt-24 relative z-20">
              {/* Prominent Back to Articles Button */}
              <div className="mb-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#c3d2ea] hover:text-[#2fd8f2] py-2 px-4 rounded-full bg-[#122036] border-[1.5px] border-[#22345a] hover:border-[#0e7d99] transition-all group"
                >
                  <span className="group-hover:-translate-x-1.5 transition-transform duration-200 text-[#2fd8f2] font-bold">←</span>
                  <span>Back to all articles</span>
                </Link>
              </div>

              {/* Desktop & Mobile Breadcrumb with Live Blog Interactions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#1a2947]">
                <nav className="flex items-center gap-2 text-sm text-[#a9bedd]">
                  <Link href="/" className="hover:text-[#2fd8f2] transition-colors">Home</Link>
                  <span className="text-[#22345a]">/</span>
                  <Link href="/blog" className="hover:text-[#2fd8f2] transition-colors">Blog</Link>
                  <span className="text-[#22345a]">/</span>
                  <span className="text-[#eef4ff] truncate max-w-[240px]">{post.title_en}</span>
                </nav>
                <BlogInteractions />
              </div>

              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-8">
                <TableOfContents content={post.content_en ?? ""} />
              </div>

              {/* Listen to Article Audio Reader */}
              <ArticleAudioPlayer
                title={post.title_en}
                content={post.content_en ?? ""}
                excerpt={post.excerpt_en ?? ""}
                readTimeMin={post.read_time_min}
                lang="en"
              />

              <div className="w-full my-6">
                <ArticleContent content={post.content_en ?? ""} />
              </div>

              {/* End-of-post High-Converting Freelance & AI Client CTA */}
              <ArticleCTA lang="en" />

              {/* Bottom Claps & Feedback Bar */}
              <div className="mt-10 p-5 rounded-2xl bg-[#122036] border-[1.5px] border-[#1a2947] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-[#eef4ff] text-sm">Found this article helpful?</p>
                  <p className="text-xs text-[#a9bedd]">Give some claps to support more in-depth engineering logs!</p>
                </div>
                <BlogInteractions />
              </div>

              {/* Tags */}
              {post.post_tags && post.post_tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#1a2947]">
                  <h3 className="font-mono text-[12.5px] tracking-[0.09em] uppercase text-[#ffb02e] mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.post_tags.map(({ tags: tag }) => (
                      <Link
                        key={tag.id}
                        href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                        className="px-4 py-2 rounded-full font-mono text-[12.5px] bg-[#0e1729] border-[1.5px] border-[#22345a] text-[#c3d2ea] hover:text-[#2fd8f2] hover:border-[#0e7d99] transition-colors"
                      >
                        #{tag.name_en}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Next / Previous Article Navigation */}
              <PostNavigation prev={adjacent.prev} next={adjacent.next} lang="en" />
              
              {/* Premium Author Card */}
              <div className="mt-12 p-8 bg-[#0e1729] rounded-[20px] border-[1.5px] border-[#1a2947] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#2fd8f2]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ffb02e]/10 rounded-full blur-3xl"></div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-[#ffb02e] flex items-center justify-center text-[#1a1200] font-bold text-3xl ring-4 ring-[#122036] flex-shrink-0">
                    Z
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xl font-bold text-[#eef4ff]">Zahid Hasan Tonmoy</p>
                    <p className="font-mono text-[12px] tracking-[0.09em] uppercase text-[#2fd8f2] mt-1 mb-3">Author & Developer</p>
                    <p className="text-[#c3d2ea] leading-relaxed">
                      MERN Full Stack Developer &amp; AI Agent Developer based in Dhaka, Bangladesh.
                      Writing about web development, React, PostgreSQL and my learning journey.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#122036] border-[1.5px] border-[#22345a] text-sm font-extrabold text-[#eef4ff] hover:border-[#2fd8f2] transition-all group"
                      >
                        View Portfolio
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                      <a
                        href="https://medium.com/@zahidhasantonmoy"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Medium profile"
                        title="Follow on Medium"
                        className="p-2.5 rounded-full bg-[#122036] border-[1.5px] border-[#22345a] text-[#c3d2ea] hover:text-[#2fd8f2] hover:border-[#0e7d99] transition-all"
                      >
                        <FaMedium size={16} />
                      </a>
                      <a
                        href="https://dev.to/zahidhasantonmoy"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Dev.to profile"
                        title="Articles on DEV.to"
                        className="p-2.5 rounded-full bg-[#122036] border-[1.5px] border-[#22345a] text-[#c3d2ea] hover:text-[#2fd8f2] hover:border-[#0e7d99] transition-all"
                      >
                        <FaDev size={16} />
                      </a>
                      <a
                        href="https://github.com/zahidhasantonmoy"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub profile"
                        title="GitHub Profile"
                        className="p-2.5 rounded-full bg-[#122036] border-[1.5px] border-[#22345a] text-[#c3d2ea] hover:text-[#2fd8f2] hover:border-[#0e7d99] transition-all"
                      >
                        <FaGithub size={16} />
                      </a>
                      <a
                        href="https://buymeacoffee.com/zahidhasantonmoy"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Buy Me a Coffee"
                        title="Support on Buy Me a Coffee"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ffb02e]/10 text-[#ffb02e] border border-[#ffb02e]/40 text-xs font-semibold hover:scale-105 transition-all"
                      >
                        <FaCoffee size={14} />
                        <span>Buy Me a Coffee</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Right Multi-Widget Desktop Sidebar */}
            <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-28 self-start space-y-6">
              <TableOfContents content={post.content_en ?? ""} lang="en" />
              <AuthorMiniCard lang="en" />
              {related.length > 0 && <SidebarRelatedPosts posts={related} lang="en" />}
            </aside>
          </div>
        </BlogReaderProvider>

        {/* Related Posts Bottom Section */}
        {related.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-20">
            <RelatedPosts posts={related} />
          </section>
        )}
      </main>
    </>
  );
}
