import Link from "next/link";
import type { Post } from "@/types/blog";

interface RelatedPostsProps {
  posts: Post[];
  lang?: "en" | "bn";
}

export default function RelatedPosts({ posts, lang = "en" }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <h3 className="font-['Unbounded',sans-serif] text-xl font-bold text-[#eef4ff] mb-6">
        {lang === "bn" ? "সম্পর্কিত আর্টিকেল" : "Related Articles"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post) => {
          const title = lang === "bn" && post.title_bn ? post.title_bn : post.title_en;
          const href = lang === "bn" ? `/bn/blog/${post.slug}` : `/blog/${post.slug}`;

          return (
            <Link
              key={post.id}
              href={href}
              className="group p-5 bg-[#0e1729] border-[1.5px] border-[#1a2947] rounded-[20px] hover:border-[#0e7d99] transition"
            >
              <h4 className="font-semibold text-[#eef4ff] group-hover:text-[#2fd8f2] transition line-clamp-2 mb-2 text-sm">
                {title}
              </h4>
              <p className="font-mono text-xs text-[#a9bedd]">
                {formatDate(post.published_at)}
                {formatDate(post.published_at) ? " · " : ""}
                {post.read_time_min} {lang === "bn" ? "মিনিটের পড়া" : "min read"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
