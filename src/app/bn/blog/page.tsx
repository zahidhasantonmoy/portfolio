import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getCategories } from "@/lib/blog";
import LiveBlogList from "@/components/blog/LiveBlogList";

export const revalidate = 60; // ISR — 60 seconds

export const metadata: Metadata = {
  title: "বাংলা টেক ব্লগ | জাহিদ হাসান তন্ময় - MERN ও AI ইঞ্জিনিয়ারিং",
  description:
    "MERN স্ট্যাক, Next.js, React, TypeScript, পাইথন মেশিন লার্নিং ও এআই এজেন্ট ডেভেলপমেন্ট সহ আধুনিক ওয়েব প্রযুক্তির উপর বাংলায় গভীর টেকনিক্যাল আর্টিকেল ও টিউটোরিয়াল।",
  keywords: [
    "বাংলা ব্লগ",
    "প্রোগ্রামিং টিউটোরিয়াল বাংলা",
    "MERN Stack Bangla",
    "Next.js Bangla Tutorial",
    "React বাংলা",
    "মেশিন লার্নিং বাংলা",
    "জাহিদ হাসান তন্ময়",
    "ওয়েব ডেভেলপমেন্ট বাংলাদেশ"
  ],
  openGraph: {
    title: "বাংলা টেক ব্লগ | জাহিদ হাসান তন্ময় - MERN ও AI ইঞ্জিনিয়ারিং",
    description: "MERN স্ট্যাক, Next.js, React, TypeScript, পাইথন মেশিন লার্নিং ও এআই এজেন্ট ডেভেলপমেন্ট সহ আধুনিক ওয়েব প্রযুক্তির উপর বাংলায় টেকনিক্যাল আর্টিকেল।",
    url: "https://zahidhasantonmoy.vercel.app/bn/blog",
    type: "website",
    locale: "bn_BD",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "জাহিদ হাসান তন্ময় — বাংলা টেক ব্লগ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "বাংলা টেক ব্লগ | জাহিদ হাসান তন্ময় - MERN ও AI ইঞ্জিনিয়ারিং",
    description: "MERN স্ট্যাক, Next.js, React, TypeScript, মেশিন লার্নিং ও এআই এজেন্ট ডেভেলপমেন্টের উপর বাংলায় টেকনিক্যাল আর্টিকেল।",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/bn/blog",
    languages: {
      bn: "https://zahidhasantonmoy.vercel.app/bn/blog",
      en: "https://zahidhasantonmoy.vercel.app/blog",
    },
  },
};

export default async function BnBlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts({ limit: 100 }),
    getCategories(),
  ]);

  // Live total from the DB — never hardcoded.
  const totalPosts = posts.length;

  return (
    <main className="min-h-screen bg-[#060a13] text-[#eef4ff]" lang="bn">
      <div className="max-w-[1220px] mx-auto px-[21px] md:px-[34px] pt-16 pb-20">
        {/* R4 section head */}
        <div>
          <span className="font-mono text-[13px] tracking-[0.12em] text-[#2fd8f2] uppercase">
            ০৫ · ব্লগ
          </span>
          <h1 className="font-['Unbounded',sans-serif] font-bold text-[clamp(27px,4.6vw,42px)] leading-[1.15] text-[#eef4ff] mt-3">
            আমার ব্লগ — {totalPosts}টি পোস্ট, বেশিরভাগই এআই এজেন্ট কীভাবে বানানো হয় তা নিয়ে
          </h1>
          <p className="text-[#c3d2ea] text-[17.5px] max-w-[64ch] mt-4">
            যা শিখি, তা শেখাতেই লিখি। নতুন{" "}
            <strong className="text-[#eef4ff]">৬টি পোস্টে</strong> সহজ ভাষায়
            এক লাইনের সারাংশ আছে; সব {totalPosts}টি পোস্ট এখানেই আছে — টপিক
            খুঁজতে <strong className="text-[#eef4ff]">সার্চ বা ফিল্টার</strong>{" "}
            করুন।
          </p>
          <Link
            href="/blog"
            className="inline-block mt-4 text-sm text-[#2fd8f2] hover:text-[#ffb02e] underline underline-offset-4 transition-colors"
          >
            Read in English →
          </Link>
        </div>

        <LiveBlogList
          initialPosts={posts}
          categories={categories}
          lang="bn"
        />
      </div>
    </main>
  );
}
