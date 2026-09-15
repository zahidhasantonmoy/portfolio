import { createAdminClient } from "@/lib/supabase-server";
import PostEditor from "../../PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: post }, { data: categories }, { data: tags }, { data: postTags }] =
    await Promise.all([
      admin.from("posts").select("*").eq("id", id).single(),
      admin.from("categories").select("id, name_en, slug").order("name_en"),
      admin.from("tags").select("id, name_en, slug").order("name_en"),
      admin.from("post_tags").select("tag_id").eq("post_id", id),
    ]);

  if (!post) notFound();

  const selectedTagIds = (postTags ?? []).map((pt: { tag_id: string }) => pt.tag_id);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Post</h1>
        <p className="text-gray-400 text-sm mt-1 truncate">{post.title_en}</p>
      </div>
      <PostEditor
        post={post}
        categories={categories ?? []}
        tags={tags ?? []}
        selectedTagIds={selectedTagIds}
        mode="edit"
      />
    </div>
  );
}
