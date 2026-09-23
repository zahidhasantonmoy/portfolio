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
    return { title: "Case Study Not Found" };
  }

  const base = "https://zahidhasantonmoy.vercel.app";
  const title = cs.seo.seo_title_en || `${cs.english.title} | Zahid Hasan Tonmoy`;
  const description = cs.seo.meta_description_en;
  const dynamicOgImage = `${base}/work/${slug}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/work/${slug}`,
      type: "article",
      publishedTime: cs.published_date,
      modifiedTime: cs.updated_date,
      authors: ["Zahid Hasan Tonmoy"],
      images: [
        {
          url: dynamicOgImage,
          width: 1200,
          height: 630,
          alt: cs.thumbnail?.alt_en || title,
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
      canonical: `${base}/work/${slug}`,
      languages: {
        en: `${base}/work/${slug}`,
        bn: `${base}/bn/work/${slug}`,
        "x-default": `${base}/work/${slug}`,
      },
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = await getCaseStudyBySlug(slug);

  if (!caseStudy || caseStudy.status !== "published") {
    notFound();
  }

  return <CaseStudyView caseStudy={caseStudy} lang="en" />;
}
