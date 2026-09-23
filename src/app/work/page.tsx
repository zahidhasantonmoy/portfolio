import type { Metadata } from "next";
import { getAllCaseStudies } from "@/lib/case-studies";
import CaseStudyList from "@/components/work/CaseStudyList";

export const revalidate = 60; // ISR — 60 seconds

export const metadata: Metadata = {
  title: "Work & Case Studies | Zahid Hasan Tonmoy — Full Stack & AI Developer",
  description:
    "Explore detailed technical case studies of web applications, AI agents, and full-stack software architectures built by Zahid Hasan Tonmoy. Real challenges, technical trade-offs, and measurable results.",
  openGraph: {
    title: "Work & Case Studies | Zahid Hasan Tonmoy",
    description:
      "Production-grade engineering case studies — architecture deep-dives, trade-offs, and measurable outcomes.",
    url: "https://zahidhasantonmoy.vercel.app/work",
    type: "website",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zahid Hasan Tonmoy — Work & Case Studies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work & Case Studies | Zahid Hasan Tonmoy",
    description: "Production-grade engineering case studies and architecture deep-dives.",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/work",
    languages: {
      en: "https://zahidhasantonmoy.vercel.app/work",
      bn: "https://zahidhasantonmoy.vercel.app/bn/work",
      "x-default": "https://zahidhasantonmoy.vercel.app/work",
    },
  },
};

export default async function WorkPage() {
  const caseStudies = await getAllCaseStudies({ status: "published" });
  return <CaseStudyList caseStudies={caseStudies} lang="en" />;
}
