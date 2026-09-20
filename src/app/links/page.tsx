import type { Metadata } from "next";
import LinksClient from "./LinksClient";

export const revalidate = 86400; // Cache for 24h

const BASE_URL = "https://zahidhasantonmoy.vercel.app";

export const metadata: Metadata = {
  title: "Links & Social Hub | Zahid Hasan Tonmoy",
  description:
    "Official link hub and social directory for Zahid Hasan Tonmoy — MERN Full Stack Developer, AI Agent Developer & Data Analyst. Connect on GitHub, LinkedIn, DEV.to, Telegram, and Medium.",
  keywords: [
    "Zahid Hasan Tonmoy links",
    "Zahid Hasan Tonmoy social profiles",
    "Zahid Hasan Tonmoy GitHub",
    "Zahid Hasan Tonmoy LinkedIn",
    "Zahid Hasan Tonmoy Telegram",
    "Zahid Hasan Tonmoy DEV.to",
    "MERN developer links",
    "AI Agent developer contact",
  ],
  alternates: {
    canonical: `${BASE_URL}/links`,
  },
  openGraph: {
    title: "Zahid Hasan Tonmoy — Links & Social Hub",
    description:
      "Connect with Zahid Hasan Tonmoy across GitHub, LinkedIn, Telegram, DEV.to, and explore live software projects and technical writing.",
    url: `${BASE_URL}/links`,
    siteName: "Zahid Hasan Tonmoy's Portfolio",
    images: [
      {
        url: `${BASE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Zahid Hasan Tonmoy — Links & Social Hub",
      },
    ],
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zahid Hasan Tonmoy — Links & Social Hub",
    description:
      "All-in-one link directory for Zahid Hasan Tonmoy: GitHub, LinkedIn, Telegram, DEV.to, Tech Blogs, and Resume Requests.",
    creator: "@zahidhasan_bd",
    images: [`${BASE_URL}/images/og-image.jpg`],
  },
};

export default function LinksPage() {
  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${BASE_URL}/links#profilepage`,
    url: `${BASE_URL}/links`,
    name: "Zahid Hasan Tonmoy — Links & Social Hub",
    isPartOf: {
      "@type": "WebSite",
      name: "Zahid Hasan Tonmoy Portfolio",
      url: BASE_URL,
    },
    mainEntity: {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      name: "Zahid Hasan Tonmoy",
      alternateName: ["Zahid Hasan", "Tonmoy"],
      jobTitle: "MERN Full Stack Developer & AI Agent Developer",
      url: BASE_URL,
      image: `${BASE_URL}/images/profile.jpg`,
      description:
        "MERN Full Stack Developer, AI Agent Developer, and Data Analyst based in Dhaka, Bangladesh.",
      alumniOf: {
        "@type": "EducationalOrganization",
        name: "Bangladesh University of Business and Technology (BUBT)",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dhaka",
        addressCountry: "Bangladesh",
      },
      sameAs: [
        "https://github.com/zahidhasantonmoy",
        "https://www.linkedin.com/in/zahidhasantonmoy/",
        "https://t.me/zahidhasan_bd",
        "https://dev.to/zahidhasantonmoy",
        "https://medium.com/@zahidhasantonmoy",
        "https://x.com/zahidhasan_bd",
        "https://www.facebook.com/zahidhasantonmoybd",
        "https://buymeacoffee.com/zahidhasantonmoy",
      ],
    },
    hasPart: {
      "@type": "ItemList",
      name: "Official Social and Professional Links",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Telegram Direct Chat",
          url: "https://t.me/zahidhasan_bd",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "LinkedIn Profile",
          url: "https://www.linkedin.com/in/zahidhasantonmoy/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "GitHub Profile",
          url: "https://github.com/zahidhasantonmoy",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Official Portfolio",
          url: BASE_URL,
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "DEV.to Articles",
          url: "https://dev.to/zahidhasantonmoy",
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "Medium Articles",
          url: "https://medium.com/@zahidhasantonmoy",
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />
      <LinksClient />
    </>
  );
}
