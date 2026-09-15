import { createAdminClient } from "@/lib/supabase-server";
import PostEditor from "../PostEditor";

export default async function NewPostPage() {
  const admin = createAdminClient();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    admin.from("categories").select("id, name_en, slug").order("name_en"),
    admin.from("tags").select("id, name_en, slug").order("name_en"),
  ]);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Post</h1>
        <p className="text-gray-400 text-sm mt-1">Create a new blog post or journal entry</p>
      </div>
      <PostEditor
        categories={categories ?? []}
        tags={tags ?? []}
        mode="create"
      />
    </div>
  );
}
