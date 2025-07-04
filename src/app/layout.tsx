import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zahid Hasan Tonmoy | Data Analyst, AI Agent Developer & Digital Marketer",
  description: "Zahid Hasan Tonmoy's official portfolio. Specializing in Data Analysis, AI Agent Development, and Digital Marketing. Explore projects, skills, and achievements.",
  keywords: "Zahid Hasan Tonmoy, Data Analyst, AI Agent Developer, Digital Marketer, Machine Learning, Deep Learning, AI, WordPress, Portfolio, Projects, Skills, Bangladesh",
  openGraph: {
    title: "Zahid Hasan Tonmoy | Data Analyst, AI Agent Developer & Digital Marketer",
    description: "Zahid Hasan Tonmoy's official portfolio. Specializing in Data Analysis, AI Agent Development, and Digital Marketing. Explore projects, skills, and achievements.",
    url: "https://zahidhasantonmoy.vercel.app", // Replace with your actual domain
    siteName: "Zahid Hasan Tonmoy's Portfolio",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/profile.jpg", // Replace with your actual profile image URL
        width: 800,
        height: 600,
        alt: "Zahid Hasan Tonmoy Profile Picture",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zahid Hasan Tonmoy | Data Analyst, AI Agent Developer & Digital Marketer",
    description: "Zahid Hasan Tonmoy's official portfolio. Specializing in Data Analysis, AI Agent Development, and Digital Marketing. Explore projects, skills, and achievements.",
    creator: "@zahidhasantonmoy", // Replace with your Twitter handle
    images: ["https://zahidhasantonmoy.vercel.app/images/profile.jpg"], // Replace with your actual profile image URL
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://zahidhasantonmoy.vercel.app", // Replace with your actual domain
  },
};

import Providers from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="scroll-smooth">
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
