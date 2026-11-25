import Link from "next/link";
import {
  getPublishedPosts,
  getPublishedPostCount,
  getCategories,
  getCategoryCounts,
  getTagsForPostIds,
} from "@/lib/blog";
import LiveBlogList from "@/components/blog/LiveBlogList";

/**
 * Redesign 4 home blog teaser — same live DB data and the same
 * LiveBlogList (search + category chips + cards) as /blog, embedded
 * in the home page between Story and GitHub. Nothing is hardcoded:
 * the post count and categories come from the database. Shows the
 * 6 newest posts; search/category input navigates to the full blog.
 */
export default async function HomeBlogSection() {
  const [posts, totalPosts, categories, categoryCounts] = await Promise.all([
    getPublishedPosts({ limit: 6 }),
    getPublishedPostCount(),
    getCategories(),
    getCategoryCounts(),
  ]);
  const postTags = await getTagsForPostIds(posts.map((p) => p.id));

  return (
    <section className="block wrap" id="blog">
      <div className="sec-head rv">
        <span className="sec-tag">05 · Blog</span>
        <h2>
          My blog — {totalPosts} posts, mostly on how AI agents are built
        </h2>
        <p>
          I write to teach what I learn. The{" "}
          <strong>6 newest posts</strong> come with a one-line summary in
          simple words; all {totalPosts} are here —{" "}
          <strong>search or filter</strong> to find a topic.
        </p>
      </div>
      <LiveBlogList
        initialPosts={posts}
        categories={categories}
        categoryCounts={categoryCounts}
        postTags={postTags}
        totalCount={totalPosts}
        basePath="/blog"
      />
      <p style={{ marginTop: "16px" }}>
        <Link className="btn btn-ghost" href="/blog">
          Open the full blog ↗
        </Link>
      </p>
    </section>
  );
}
