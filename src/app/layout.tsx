import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zahid Hasan Tonmoy | MERN Full Stack Developer, Data Analyst & AI Agent Developer",
  description: "Zahid Hasan Tonmoy — MERN Full Stack Developer, Data Analyst, AI Agent Developer & Digital Marketer based in Dhaka, Bangladesh. Expert in MongoDB, Express.js, React, Node.js, Machine Learning, and Digital Marketing.",
  keywords: "Zahid Hasan Tonmoy, MERN Full Stack Developer, Data Analyst, AI Agent Developer, Digital Marketer, MongoDB, Express.js, React, Node.js, Machine Learning, Deep Learning, AI, Next.js, TypeScript, Bangladesh, Dhaka, Portfolio, Projects, Skills",
  openGraph: {
    title: "Zahid Hasan Tonmoy | MERN Full Stack Developer, Data Analyst & AI Agent Developer",
    description: "Zahid Hasan Tonmoy — MERN Full Stack Developer, Data Analyst, AI Agent Developer & Digital Marketer based in Dhaka, Bangladesh. Expert in MongoDB, Express.js, React, Node.js, Machine Learning, and Digital Marketing.",
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
    title: "Zahid Hasan Tonmoy | MERN Full Stack Developer, Data Analyst & AI Agent Developer",
    description: "Zahid Hasan Tonmoy — MERN Full Stack Developer, Data Analyst, AI Agent Developer & Digital Marketer based in Dhaka, Bangladesh.",
    creator: "@zahidhasantonmoy",
    images: ["https://zahidhasantonmoy.vercel.app/images/profile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="-eYrJsU0hcmA8pqXUHm7_eB0wJ4RNDp_46BntwN6-z8" />
        {/* GEO (Generative Engine Optimization) — helps AI engines like ChatGPT, Perplexity, Google AI Overviews */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        {/* llms.txt — machine-readable summary for LLM crawlers */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="AI-readable site summary" />
        {/* Structured JSON endpoint for AI agents */}
        <link rel="alternate" type="application/json" href="/api/about" title="Structured portfolio data" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Zahid Hasan Tonmoy",
              "jobTitle": "MERN Full Stack Developer, Data Analyst, AI Agent Developer & Digital Marketer",
              "description": "MERN Full Stack Developer and Data Analyst based in Dhaka, Bangladesh. Specialises in MongoDB, Express.js, React, Node.js, Machine Learning, AI Agent Development, and Digital Marketing.",
              "url": "https://zahidhasantonmoy.vercel.app",
              "image": "https://zahidhasantonmoy.vercel.app/images/profile.jpg",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Dhaka",
                "addressCountry": "BD"
              },
              "knowsAbout": [
                "MERN Stack Development",
                "MongoDB",
                "Express.js",
                "React",
                "Node.js",
                "TypeScript",
                "REST API",
                "Data Analysis",
                "Machine Learning",
                "AI Agent Development",
                "Digital Marketing",
                "Next.js",
                "Python",
                "TensorFlow"
              ],
              "knowsLanguage": ["en", "bn"],
              "nationality": "Bangladeshi",
              "alumniOf": {
                "@type": "CollegeOrUniversity",
                "name": "Daffodil International University"
              },
              "sameAs": [
                "https://github.com/zahidhasantonmoy"
              ]
            })
          }}
        />
        {/* FAQ Schema — directly cited by Google AI Overviews, ChatGPT, and Perplexity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Who is Zahid Hasan Tonmoy?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Zahid Hasan Tonmoy is a MERN Full Stack Developer, Data Analyst, AI Agent Developer, and Digital Marketer based in Dhaka, Bangladesh. He is currently pursuing a B.Sc in Computer Science & Engineering at Daffodil International University and has built 9+ projects spanning web apps, mobile apps, IoT, and machine learning."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What technologies does Zahid Hasan Tonmoy specialize in?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Zahid specialises in the MERN stack (MongoDB, Express.js, React, Node.js), Next.js, TypeScript, REST APIs, and JWT authentication for full-stack web development. For data science, he uses Python, Pandas, NumPy, TensorFlow, Keras, PyTorch, and Scikit-learn. He also works with Flutter, Firebase, and Supabase for mobile and backend projects."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What projects has Zahid Hasan Tonmoy built?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Zahid has built 9+ projects: Flexpath (gig economy mobile app for Bangladesh using Flutter & Supabase), Gold Price Predictor (ML app with R² ≈ 0.9999 accuracy using Python & Scikit-learn), Curious Cart BD (Next.js e-commerce platform), Jerseyvault (React + Supabase e-commerce), Vortex Shield (AES-GCM file encryption tool), LocalDrop Pro (P2P WebRTC file sharing PWA), Halarnati (PHP file sharing platform), OffenseOrbit (crime management platform), and a Smart Drainage System IoT project."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Zahid Hasan Tonmoy available for freelance or full-time work?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Zahid Hasan Tonmoy is available for freelance projects and full-time opportunities in MERN stack development, data analysis, and AI development. You can contact him through his portfolio at https://zahidhasantonmoy.vercel.app/#contact"
                  }
                },
                {
                  "@type": "Question",
                  "name": "Where is Zahid Hasan Tonmoy located?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Zahid Hasan Tonmoy is based in Dhaka, Bangladesh. He works remotely and is open to both local Bangladeshi clients and international opportunities."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is Zahid Hasan Tonmoy's educational background?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Zahid is currently pursuing a B.Sc in Computer Science & Engineering at Daffodil International University (2021–present), with a focus on AI, Machine Learning, and Software Development. He won a Software Development Competition in 2024 and completed a Data Analysis Internship at Tech Solutions Ltd. in 2022."
                  }
                }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Zahid Hasan Tonmoy's Portfolio",
              "url": "https://zahidhasantonmoy.vercel.app",
              "description": "Portfolio of Zahid Hasan Tonmoy — MERN Full Stack Developer, Data Analyst, AI Agent Developer & Digital Marketer based in Dhaka, Bangladesh.",
              "inLanguage": "en",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://zahidhasantonmoy.vercel.app/#projects?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
