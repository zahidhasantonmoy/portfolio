import { sql } from "@/lib/db";
import PostEditor from "../PostEditor";

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    sql`SELECT id, name_en, slug FROM categories ORDER BY name_en`,
    sql`SELECT id, name_en, slug FROM tags ORDER BY name_en`,
  ]);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Post</h1>
        <p className="text-gray-400 text-sm mt-1">Create a new blog post or journal entry</p>
      </div>
      <PostEditor
        categories={categories as any[]}
        tags={tags as any[]}
        mode="create"
      />
    </div>
  );
}
