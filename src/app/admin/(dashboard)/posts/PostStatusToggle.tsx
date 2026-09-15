'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface PostStatusToggleProps {
  postId: string;
  initialStatus: string;
}

export default function PostStatusToggle({
  postId,
  initialStatus,
}: PostStatusToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    if (loading) return;

    const nextStatus = status === 'published' ? 'draft' : 'published';
    const previousStatus = status;

    setStatus(nextStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          published_at: nextStatus === 'published' ? new Date().toISOString() : null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(
        nextStatus === 'published'
          ? 'Post published live! 🚀'
          : 'Post moved to draft.'
      );
    } catch (err: any) {
      setStatus(previousStatus);
      toast.error(err?.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const isPublished = status === 'published';

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      title={`Click to switch to ${isPublished ? 'draft' : 'published'}`}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition shadow-sm ${
        loading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:scale-105'
      } ${
        isPublished
          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
          : 'bg-yellow-950/60 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-900/60'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPublished ? 'bg-emerald-400' : 'bg-yellow-400'
        }`}
      />
      <span className="capitalize">{status}</span>
    </button>
  );
}
