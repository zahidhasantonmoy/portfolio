import Link from "next/link";
import type { Post } from "@/types/blog";

interface RelatedPostsProps {
  posts: Post[];
  lang?: "en" | "bn";
}

export default function RelatedPosts({ posts, lang = "en" }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Related Articles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post) => {
          const title = lang === "bn" && post.title_bn ? post.title_bn : post.title_en;
          const href = lang === "bn" ? `/bn/blog/${post.slug}` : `/blog/${post.slug}`;

          return (
            <Link
              key={post.id}
              href={href}
              className="group p-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 mb-2 text-sm">
                {title}
              </h4>
              <p className="text-xs text-gray-500">
                {post.read_time_min} min read
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
