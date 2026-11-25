"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/** Two-step inline confirm delete for a journal entry (mirrors DeletePostButton). */
export default function DeleteJournalButton({
  entryId,
  entryTitle,
}: {
  entryId: string;
  entryTitle: string;
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
      const res = await fetch(`/api/admin/journal?id=${entryId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete entry");
      }
      toast.success("Journal entry deleted.");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error deleting entry");
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
      title={confirming ? `Click again to confirm deleting “${entryTitle}”` : "Delete entry"}
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
