import type { Metadata } from "next";
import { getAllCaseStudies } from "@/lib/case-studies";
import CaseStudyList from "@/components/work/CaseStudyList";

export const revalidate = 60; // ISR — 60 seconds

export const metadata: Metadata = {
  title: "কেস স্টাডি ও প্রজেক্ট সমূহ | জাহিদ হাসান তন্ময় — ফুল-স্ট্যাক ও এআই ডেভেলপার",
  description:
    "জাহিদ হাসান তন্ময়ের তৈরি ওয়েব অ্যাপ্লিকেশন, এআই এজেন্ট এবং ব্যাকএন্ড আর্কিটেকচারের কারিগরি কেস স্টাডি। বাস্তব সমস্যা, কারিগরি চ্যালেঞ্জ, সিদ্ধান্ত এবং পরিমাপযোগ্য ফলাফল।",
  openGraph: {
    title: "কেস স্টাডি ও প্রজেক্ট সমূহ | জাহিদ হাসান তন্ময়",
    description:
      "বাস্তব প্রজেক্টের ইঞ্জিনিয়ারিং কেস স্টাডি — আর্কিটেকচারাল সিদ্ধান্ত ও কারিগরি সমাধান।",
    url: "https://zahidhasantonmoy.vercel.app/bn/work",
    type: "website",
    locale: "bn_BD",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "জাহিদ হাসান তন্ময় — কেস স্টাডি সমূহ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "কেস স্টাডি ও প্রজেক্ট সমূহ | জাহিদ হাসান তন্ময়",
    description: "বাস্তব প্রজেক্টের ইঞ্জিনিয়ারিং কেস স্টাডি — আর্কিটেকচারাল সিদ্ধান্ত ও কারিগরি সমাধান।",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/bn/work",
    languages: {
      bn: "https://zahidhasantonmoy.vercel.app/bn/work",
      en: "https://zahidhasantonmoy.vercel.app/work",
      "x-default": "https://zahidhasantonmoy.vercel.app/work",
    },
  },
};

export default async function BanglaWorkPage() {
  const caseStudies = await getAllCaseStudies({ status: "published" });
  return <CaseStudyList caseStudies={caseStudies} lang="bn" />;
}
