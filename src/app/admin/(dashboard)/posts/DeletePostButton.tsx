"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeletePostButton({
  postId,
  postTitle,
}: {
  postId: string;
  postTitle: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      toast.success("Post deleted.");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting post");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      onBlur={() => {
        // Give the second click a chance to land before resetting.
        window.setTimeout(() => setConfirming(false), 2500);
      }}
      disabled={deleting}
      title={confirming ? `Click again to confirm deleting “${postTitle}”` : "Delete post"}
      className={`text-xs font-medium transition disabled:opacity-50 ${
        confirming
          ? "text-rose-300 bg-rose-500/15 border border-rose-500/40 px-2 py-1 rounded-lg"
          : "text-ink-mute hover:text-rose-400"
      }`}
    >
      {deleting ? "Deleting…" : confirming ? "Confirm delete?" : "Delete"}
    </button>
  );
}
