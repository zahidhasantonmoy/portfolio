import Link from "next/link";
import type { Post } from "@/types/blog";

interface BlogCardProps {
  post: Post;
  lang?: "en" | "bn";
}

/**
 * Redesign 4 blog card — cover image on top, cyan mono category tag,
 * bold title, excerpt, and a mono "date · read time" footer.
 * All content comes from the DB `Post` — nothing is hardcoded.
 */
export default function BlogCard({ post, lang = "en" }: BlogCardProps) {
  const title = lang === "bn" && post.title_bn ? post.title_bn : post.title_en;
  const excerpt = lang === "bn" && post.excerpt_bn ? post.excerpt_bn : post.excerpt_en;
  const href = lang === "bn" ? `/bn/blog/${post.slug}` : `/blog/${post.slug}`;
  const catName = post.categories
    ? lang === "bn" && post.categories.name_bn
      ? post.categories.name_bn
      : post.categories.name_en
    : null;

  const publishDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const minRead = lang === "bn" ? "মিনিটের পড়া" : "min read";

  return (
    <Link
      href={href}
      className="group flex flex-col bg-[#0e1729] border-[1.5px] border-[#1a2947] rounded-[20px] overflow-hidden hover:border-[#0e7d99] transition-colors"
    >
      {/* Cover Image */}
      {post.cover_image_url ? (
        <div className="h-44 overflow-hidden bg-[#0a1120]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-44 bg-[#0a1120] border-b-[1.5px] border-[#1a2947] flex items-center justify-center">
          <span className="font-mono text-xs tracking-[0.12em] uppercase text-[#2fd8f2]">
            {catName ?? "Blog"}
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Category mono tag */}
        {catName && (
          <span className="font-mono text-[11px] text-[#2fd8f2] tracking-[0.07em] uppercase mb-2">
            {catName}
          </span>
        )}

        {/* Title */}
        <h2 className="font-bold text-[16.5px] leading-[1.35] text-[#eef4ff] group-hover:text-[#2fd8f2] transition-colors line-clamp-2 mb-2">
          {title}
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-[14.5px] text-[#c3d2ea] line-clamp-2 flex-1 mb-4">
            {excerpt}
          </p>
        )}

        {/* Footer meta — date · read time */}
        <div className="flex items-center justify-between font-mono text-xs text-[#a9bedd] mt-auto">
          <span>{publishDate}</span>
          <span>
            {post.read_time_min} {minRead}
          </span>
        </div>
      </div>
    </Link>
  );
}
