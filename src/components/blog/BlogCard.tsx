import Link from "next/link";
import type { Post } from "@/types/blog";

interface BlogCardProps {
  post: Post;
  lang?: "en" | "bn";
}

/**
 * Redesign 4 blog card — cover image on top, cyan mono category tag,
 * bold title, excerpt, real tag chips (when the caller loaded post_tags)
 * and a mono "date · read time" footer. All content comes from the DB
 * `Post` — nothing is hardcoded. Tag chips link to the real tag filter
 * (?tag=<slug>); the card root is an <article> (not a link) so the tag
 * links are valid, non-nested anchors.
 */
export default function BlogCard({ post, lang = "en" }: BlogCardProps) {
  const title = lang === "bn" && post.title_bn ? post.title_bn : post.title_en;
  const excerpt = lang === "bn" && post.excerpt_bn ? post.excerpt_bn : post.excerpt_en;
  const href = lang === "bn" ? `/bn/blog/${post.slug}` : `/blog/${post.slug}`;
  const tagBase = lang === "bn" ? "/bn/blog" : "/blog";
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
  const tags = post.post_tags ?? [];

  return (
    <article className="group flex flex-col h-full bg-[#0e1729] border-[1.5px] border-[#1a2947] rounded-[20px] overflow-hidden hover:border-[#0e7d99] transition-colors">
      {/* Cover Image */}
      <Link href={href} aria-label={title} className="block shrink-0">
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
      </Link>

      <div className="flex flex-col flex-1 p-5">
        {/* Category mono tag */}
        {catName && (
          <span className="font-mono text-[11px] text-[#2fd8f2] tracking-[0.07em] uppercase mb-2">
            {catName}
          </span>
        )}

        {/* Title */}
        <h2 className="font-bold text-[16.5px] leading-[1.35] text-[#eef4ff] group-hover:text-[#2fd8f2] transition-colors line-clamp-2 mb-2">
          <Link href={href}>{title}</Link>
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-[14.5px] text-[#c3d2ea] line-clamp-2 mb-4">{excerpt}</p>
        )}

        {/* Tags — real tag chips, only when the caller loaded them */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map(({ tags: tag }) => (
              <Link
                key={tag.id}
                href={`${tagBase}?tag=${encodeURIComponent(tag.slug)}`}
                className="px-2.5 py-1 rounded-full font-mono text-[11px] bg-[#122036] border border-[#22345a] text-[#a9bedd] hover:text-[#2fd8f2] hover:border-[#0e7d99] transition-colors"
              >
                #{lang === "bn" && tag.name_bn ? tag.name_bn : tag.name_en}
              </Link>
            ))}
          </div>
        )}

        {/* Footer meta — date · read time */}
        <div className="flex items-center justify-between font-mono text-xs text-[#a9bedd] mt-auto">
          <span>{publishDate}</span>
          <span>
            {post.read_time_min} {minRead}
          </span>
        </div>
      </div>
    </article>
  );
}
