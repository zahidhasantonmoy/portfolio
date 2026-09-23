import type { Metadata } from "next";
import ServicesView from "@/components/services/ServicesView";

export const metadata: Metadata = {
  title: "সার্ভিসেস ও হায়ার মি | জাহিদ হাসান তন্ময় — ফুল-স্ট্যাক ও এআই ডেভেলপার",
  description:
    "ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন, এআই এজেন্ট ডেভেলপমেন্ট, এপিআই অটোমেশন এবং টেকনিক্যাল কনসালটিং। ঢাকা, বাংলাদেশ থেকে বিশ্বব্যাপী ফ্রিল্যান্স ও রিমোট প্রজেক্টের জন্য উন্মুক্ত।",
  openGraph: {
    title: "সার্ভিসেস ও হায়ার মি | জাহিদ হাসান তন্ময়",
    description:
      "ফুল-স্ট্যাক ওয়েব MVP তৈরি, এআই এজেন্ট ইন্টিগ্রেশন এবং টেকনিক্যাল কনসালটিং — ফ্রিল্যান্স ও রিমোট কাজের জন্য উন্মুক্ত।",
    url: "https://zahidhasantonmoy.vercel.app/bn/services",
    type: "website",
    locale: "bn_BD",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "জাহিদ হাসান তন্ময় — সার্ভিসেস ও হায়ার মি",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "সার্ভিসেস ও হায়ার মি | জাহিদ হাসান তন্ময়",
    description:
      "ফুল-স্ট্যাক MVP, এআই এজেন্ট, এপিআই অটোমেশন ও টেকনিক্যাল কনসালটিং — ফ্রিল্যান্স ও রিমোট।",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/bn/services",
    languages: {
      bn: "https://zahidhasantonmoy.vercel.app/bn/services",
      en: "https://zahidhasantonmoy.vercel.app/services",
      "x-default": "https://zahidhasantonmoy.vercel.app/services",
    },
  },
};

export default function BanglaServicesPage() {
  return <ServicesView lang="bn" />;
}
