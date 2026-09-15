"use client";

import { useEffect, useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaLink } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF className="w-4 h-4" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="w-4 h-4" />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: "bg-[#1DA1F2] hover:bg-[#1DA1F2]/90",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn className="w-4 h-4" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "bg-[#0A66C2] hover:bg-[#0A66C2]/90",
    },
  ];

  return (
    <div className="flex flex-col gap-3 items-center">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 hidden md:block">Share</span>
      <div className="flex md:flex-col gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-lg ${link.color}`}
          >
            {link.icon}
          </a>
        ))}
        <button
          onClick={handleCopyLink}
          aria-label="Copy link"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition-transform hover:scale-110 shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <FaLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
