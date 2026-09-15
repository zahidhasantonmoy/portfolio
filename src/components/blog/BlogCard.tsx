import Link from "next/link";
import type { Post } from "@/types/blog";

interface BlogCardProps {
  post: Post;
  lang?: "en" | "bn";
}

export default function BlogCard({ post, lang = "en" }: BlogCardProps) {
  const title = lang === "bn" && post.title_bn ? post.title_bn : post.title_en;
  const excerpt = lang === "bn" && post.excerpt_bn ? post.excerpt_bn : post.excerpt_en;
  const href = lang === "bn" ? `/bn/blog/${post.slug}` : `/blog/${post.slug}`;

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg dark:hover:shadow-indigo-900/20 transition-all duration-200"
    >
      {/* Cover Image */}
      {post.cover_image_url ? (
        <div className="h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 flex items-center justify-center text-5xl">
          📝
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Category */}
        {post.categories && (
          <span
            className="self-start text-xs px-2.5 py-0.5 rounded-full text-white font-medium mb-3"
            style={{ backgroundColor: post.categories.color }}
          >
            {lang === "bn" && post.categories.name_bn
              ? post.categories.name_bn
              : post.categories.name_en}
          </span>
        )}

        {/* Title */}
        <h2 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 mb-2 leading-snug">
          {title}
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1 mb-4">
            {excerpt}
          </p>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-auto">
          <span>{publishDate}</span>
          <span>{post.read_time_min} min read</span>
        </div>
      </div>
    </Link>
  );
}
