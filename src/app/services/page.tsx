import type { Metadata } from "next";
import ServicesView from "@/components/services/ServicesView";

export const metadata: Metadata = {
  title: "Services & Hire Me | Zahid Hasan Tonmoy — Full Stack & AI Developer",
  description:
    "Hire Zahid Hasan Tonmoy for full-stack web development, AI agent development, API integration, and technical consulting. Based in Dhaka, available worldwide for freelance & remote work.",
  openGraph: {
    title: "Services & Hire Me | Zahid Hasan Tonmoy",
    description:
      "Full-Stack MVP development, AI Agent integration, and technical consulting — available for freelance, contract, and remote work worldwide.",
    url: "https://zahidhasantonmoy.vercel.app/services",
    type: "website",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zahid Hasan Tonmoy — Services & Hire Me",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services & Hire Me | Zahid Hasan Tonmoy",
    description:
      "Full-Stack MVP, AI Agents, API automation, and technical consulting — freelance & remote.",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app/services",
    languages: {
      en: "https://zahidhasantonmoy.vercel.app/services",
      bn: "https://zahidhasantonmoy.vercel.app/bn/services",
      "x-default": "https://zahidhasantonmoy.vercel.app/services",
    },
  },
};

export default function ServicesPage() {
  return <ServicesView lang="en" />;
}
