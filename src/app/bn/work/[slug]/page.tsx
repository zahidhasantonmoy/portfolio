import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCaseStudyBySlug, getAllCaseStudies } from "@/lib/case-studies";
import CaseStudyView from "@/components/work/CaseStudyView";

export const revalidate = 60; // ISR — 60 seconds

export async function generateStaticParams() {
  const all = await getAllCaseStudies({ status: "published" });
  return all.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getCaseStudyBySlug(slug);
  if (!cs || cs.status !== "published") {
    return { title: "কেস স্টাডি পাওয়া যায়নি" };
  }

  const base = "https://zahidhasantonmoy.vercel.app";
  const title = cs.seo.seo_title_bn || `${cs.bangla.title} | জাহিদ হাসান তন্ময়`;
  const description = cs.seo.meta_description_bn;
  const dynamicOgImage = `${base}/bn/work/${slug}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/bn/work/${slug}`,
      type: "article",
      locale: "bn_BD",
      publishedTime: cs.published_date,
      modifiedTime: cs.updated_date,
      authors: ["Zahid Hasan Tonmoy"],
      images: [
        {
          url: dynamicOgImage,
          width: 1200,
          height: 630,
          alt: cs.thumbnail?.alt_bn || title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [dynamicOgImage],
    },
    alternates: {
      canonical: `${base}/bn/work/${slug}`,
      languages: {
        bn: `${base}/bn/work/${slug}`,
        en: `${base}/work/${slug}`,
        "x-default": `${base}/work/${slug}`,
      },
    },
  };
}

export default async function BanglaCaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy || caseStudy.status !== "published") {
    notFound();
  }

  return <CaseStudyView caseStudy={caseStudy} lang="bn" />;
}
