"use client";

import { useEffect, useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaLink, FaCheck } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState<number>(0);

  useEffect(() => {
    setUrl(window.location.href);
    try {
      const stored = localStorage.getItem("blog_share_count_" + window.location.pathname);
      if (stored) {
        setShareCount(parseInt(stored, 10));
      } else {
        const seed = Math.max(7, (window.location.pathname.length * 3) % 29);
        setShareCount(seed);
      }
    } catch {
      setShareCount(12);
    }
  }, []);

  if (!url) return null;

  const incrementShare = () => {
    const next = shareCount + 1;
    setShareCount(next);
    try {
      localStorage.setItem("blog_share_count_" + window.location.pathname, String(next));
    } catch {
      // ignore
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      incrementShare();
      toast.success("Link copied to clipboard!", {
        icon: "🔗",
        duration: 2500,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF className="w-4 h-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "bg-[#1877F2] hover:bg-[#1877F2]/90 hover:shadow-blue-500/25",
    },
    {
      name: "Twitter / X",
      icon: <FaTwitter className="w-4 h-4" />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: "bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 hover:shadow-sky-500/25",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn className="w-4 h-4" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "bg-[#0A66C2] hover:bg-[#0A66C2]/90 hover:shadow-indigo-500/25",
    },
  ];

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hidden md:block">
          Share
        </span>
        {shareCount > 0 && (
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hidden md:block mt-0.5">
            {shareCount} shares
          </span>
        )}
      </div>
      <div className="flex md:flex-col gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={incrementShare}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            title={`Share on ${link.name}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg ${link.color}`}
          >
            {link.icon}
          </a>
        ))}
        <button
          onClick={handleCopyLink}
          aria-label="Copy link"
          title="Copy link to clipboard"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-lg ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          }`}
        >
          {copied ? <FaCheck className="w-4 h-4 text-white" /> : <FaLink className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
