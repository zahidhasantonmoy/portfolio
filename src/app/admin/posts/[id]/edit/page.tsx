import { sql } from "@/lib/db";
import PostEditor from "../../PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [posts, categories, tags, postTags] = await Promise.all([
    sql`SELECT * FROM posts WHERE id = ${id}`,
    sql`SELECT id, name_en, slug FROM categories ORDER BY name_en`,
    sql`SELECT id, name_en, slug FROM tags ORDER BY name_en`,
    sql`SELECT tag_id FROM post_tags WHERE post_id = ${id}`,
  ]);

  const post = posts[0];
  if (!post) notFound();

  const selectedTagIds = postTags.map((pt: any) => pt.tag_id);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Post</h1>
        <p className="text-gray-400 text-sm mt-1 truncate">{post.title_en}</p>
      </div>
      <PostEditor
        post={post as any}
        categories={categories as any[]}
        tags={tags as any[]}
        selectedTagIds={selectedTagIds}
        mode="edit"
      />
    </div>
  );
}
