import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://zahidhasantonmoy.vercel.app"),
  title: "Zahid Hasan Tonmoy | MERN Full Stack Developer, Data Analyst & AI Agent Developer",
  description: "Zahid Hasan Tonmoy — MERN Full Stack Developer & AI Agent Developer based in Dhaka, Bangladesh. Explore projects, skills, and experience.",
  keywords: "Zahid Hasan Tonmoy, MERN Full Stack Developer, Data Analyst, AI Agent Developer, Digital Marketer, MongoDB, Express.js, React, Node.js, Machine Learning, Deep Learning, AI, Next.js, TypeScript, Bangladesh, Dhaka, Portfolio, Projects, Skills, Medium, Dev.to, Buy Me a Coffee, Tech Writer, Open Source",
  openGraph: {
    title: "Zahid Hasan Tonmoy | MERN Full Stack Developer, Data Analyst & AI Agent Developer",
    description: "Zahid Hasan Tonmoy — MERN Full Stack Developer & AI Agent Developer based in Dhaka, Bangladesh. Explore projects, skills, and experience.",
    url: "https://zahidhasantonmoy.vercel.app",
    siteName: "Zahid Hasan Tonmoy's Portfolio",
    images: [
      {
        url: "https://zahidhasantonmoy.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Zahid Hasan Tonmoy Profile Picture",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zahid Hasan Tonmoy | MERN Full Stack Developer, Data Analyst & AI Agent Developer",
    description: "Zahid Hasan Tonmoy — MERN Full Stack Developer & AI Agent Developer based in Dhaka, Bangladesh. Explore projects, skills, and experience.",
    site: "@zahidhasan_bd",
    creator: "@zahidhasan_bd",
    images: ["https://zahidhasantonmoy.vercel.app/images/og-image.jpg"],
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
    canonical: "https://zahidhasantonmoy.vercel.app",
    languages: {
      "en-US": "https://zahidhasantonmoy.vercel.app",
      "bn-BD": "https://zahidhasantonmoy.vercel.app/bn/blog",
      "x-default": "https://zahidhasantonmoy.vercel.app",
    },
    types: {
      "application/rss+xml": "https://zahidhasantonmoy.vercel.app/rss.xml",
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zahid Tonmoy",
  },
};

import Providers from "./providers";
import { ClientNavbar, ClientFooter, ClientChatBot, ClientResumeLeadDrawer } from "@/components/GlobalLayoutElements";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* PWA & Mobile Web App Meta Tags */}
        <meta name="theme-color" content="#030712" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Zahid Tonmoy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Zahid Tonmoy" />

        {/* Geographic & Local SEO (Dhaka, Bangladesh) */}
        <meta name="geo.region" content="BD-13" />
        <meta name="geo.placename" content="Dhaka, Bangladesh" />
        <meta name="geo.position" content="23.8103;90.4125" />
        <meta name="ICBM" content="23.8103, 90.4125" />

        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="-eYrJsU0hcmA8pqXUHm7_eB0wJ4RNDp_46BntwN6-z8" />
        {/* Bing Webmaster Tools verification */}
        <meta name="msvalidate.01" content="E05CF9D899277A036BD52256D00652CC" />
        {/* Author */}
        <meta name="author" content="Zahid Hasan Tonmoy" />
        {/* GEO (Generative Engine Optimization) — helps AI engines like ChatGPT, Perplexity, Google AI Overviews */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        {/* llms.txt & llms-full.txt — machine-readable context for LLM crawlers */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="AI-readable site summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="AI-readable full site context" />
        {/* Structured JSON endpoint for AI agents */}
        <link rel="alternate" type="application/json" href="/api/about" title="Structured portfolio data" />
        {/* Dynamic RSS 2.0 Feed for Blog Syndication & Readers */}
        <link rel="alternate" type="application/rss+xml" title="Zahid Hasan Tonmoy's Blog" href="https://zahidhasantonmoy.vercel.app/rss.xml" />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",

              // ── Core identity ──────────────────────────────────────────
              "@id": "https://zahidhasantonmoy.vercel.app/#person",
              "name": "Zahid Hasan Tonmoy",
              "givenName": "Zahid Hasan",
              "familyName": "Tonmoy",
              "alternateName": "Zahid Tonmoy",
              "gender": "Male",
              "nationality": {
                "@type": "Country",
                "name": "Bangladesh"
              },

              // ── Professional identity ──────────────────────────────────
              "jobTitle": "MERN Full Stack Developer & AI Agent Developer",
              "description": "Zahid Hasan Tonmoy is a MERN Full Stack Developer, Data Analyst, AI Agent Developer, and Digital Marketer based in Dhaka, Bangladesh. He builds end-to-end web applications using MongoDB, Express.js, React, and Node.js, and specialises in machine learning, data analysis, and digital growth strategies. He has delivered 9+ projects spanning web apps, mobile apps, IoT systems, and ML models.",

              // ── Online presence ────────────────────────────────────────
              "url": "https://zahidhasantonmoy.vercel.app",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://zahidhasantonmoy.vercel.app"
              },

              // ── Image ──────────────────────────────────────────────────
              "image": {
                "@type": "ImageObject",
                "url": "https://zahidhasantonmoy.vercel.app/images/profile.jpg",
                "width": 800,
                "height": 600,
                "caption": "Zahid Hasan Tonmoy — MERN Full Stack Developer"
              },

              // ── Location ───────────────────────────────────────────────
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Mirpur",
                "addressLocality": "Dhaka",
                "addressRegion": "Dhaka Division",
                "postalCode": "1216",
                "addressCountry": "BD"
              },
              "homeLocation": {
                "@type": "City",
                "name": "Dhaka",
                "containedInPlace": {
                  "@type": "Country",
                  "name": "Bangladesh"
                }
              },

              // ── Occupation ─────────────────────────────────────────────
              "hasOccupation": {
                "@type": "Occupation",
                "name": "MERN Full Stack Developer",
                "occupationLocation": {
                  "@type": "Country",
                  "name": "Bangladesh"
                },
                "description": "Designs and builds full-stack web applications using MongoDB, Express.js, React, and Node.js. Also specialises in data analysis and AI agent development.",
                "skills": "MongoDB, Express.js, React, Node.js, TypeScript, REST API, Next.js, Python, Machine Learning, Data Analysis"
              },
              "email": "mailto:zahidhasantonmoy.dev@gmail.com",
              "telephone": "+8801850077786",

              // ── Education ──────────────────────────────────────────────
              "alumniOf": [
                {
                  "@type": "CollegeOrUniversity",
                  "name": "Bangladesh University of Business and Technology (BUBT)",
                  "sameAs": "https://www.bubt.edu.bd",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Rupnagar R/A, Mirpur-2",
                    "addressLocality": "Dhaka",
                    "postalCode": "1216",
                    "addressCountry": "BD"
                  }
                },
                {
                  "@type": "EducationalOrganization",
                  "name": "Dhaka Udyan Government College",
                  "description": "Higher Secondary Certificate (HSC) — 2019"
                },
                {
                  "@type": "EducationalOrganization",
                  "name": "Moharkaya High School",
                  "description": "Secondary School Certificate (SSC) — 2017"
                }
              ],

              // ── Awards ─────────────────────────────────────────────────
              "award": "Software Development Competition Winner 2024, Dhaka, Bangladesh",

              // ── Knowledge & skills ─────────────────────────────────────
              "knowsAbout": [
                "MERN Stack Development",
                "MongoDB",
                "Express.js",
                "React",
                "Node.js",
                "TypeScript",
                "REST API Design",
                "JWT Authentication",
                "Redux",
                "Mongoose",
                "Next.js",
                "Tailwind CSS",
                "Data Analysis",
                "Machine Learning",
                "Python",
                "TensorFlow",
                "Keras",
                "Scikit-learn",
                "PyTorch",
                "AI Agent Development",
                "Flutter",
                "Firebase",
                "Supabase",
                "Docker",
                "SEO",
                "Digital Marketing",
                "Google Analytics"
              ],
              "knowsLanguage": [
                {
                  "@type": "Language",
                  "name": "English",
                  "alternateName": "en"
                },
                {
                  "@type": "Language",
                  "name": "Bengali",
                  "alternateName": "bn"
                }
              ],

              // ── Work examples ──────────────────────────────────────────
              "workExample": [
                {
                  "@type": "SoftwareApplication",
                  "name": "Flexpath",
                  "description": "Gig economy mobile app for Bangladesh built with Flutter and Supabase.",
                  "url": "https://github.com/zahidhasantonmoy/Flexpath",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Android, iOS, Web Browser",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "Gold Price Predictor",
                  "description": "ML regression app predicting gold prices with R² ≈ 0.9999.",
                  "url": "https://gold-price-predictor-2f1h.onrender.com/",
                  "applicationCategory": "FinanceApplication",
                  "operatingSystem": "Web Browser",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "Curious Cart BD",
                  "description": "Full-stack Next.js e-commerce platform.",
                  "url": "https://curiouscart.vercel.app/",
                  "applicationCategory": "ShoppingApplication",
                  "operatingSystem": "Web Browser",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "LocalDrop Pro",
                  "description": "P2P WebRTC file sharing PWA with end-to-end AES-GCM encryption.",
                  "url": "https://localdrop-one.vercel.app/",
                  "applicationCategory": "UtilitiesApplication",
                  "operatingSystem": "Web Browser, Windows, macOS, Linux, Android, iOS",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "Vortex Shield",
                  "description": "Cybersecurity file encryption suite with AES-GCM and Argon2id.",
                  "url": "https://protocolzero.vercel.app/",
                  "applicationCategory": "SecurityApplication",
                  "operatingSystem": "Web Browser, Windows, macOS, Linux",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  }
                }
              ],

              // ── Social profiles ────────────────────────────────────────
              "sameAs": [
                "https://github.com/zahidhasantonmoy",
                "https://www.linkedin.com/in/zahidhasantonmoy/",
                "https://www.facebook.com/zahidhasantonmoybd",
                "https://x.com/zahidhasan_bd",
                "https://medium.com/@zahidhasantonmoy",
                "https://dev.to/zahidhasantonmoy",
                "https://buymeacoffee.com/zahidhasantonmoy"
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
                    "text": "Zahid Hasan Tonmoy is a MERN Full Stack Developer, Data Analyst, AI Agent Developer, and Digital Marketer based in Dhaka, Bangladesh. He is currently pursuing a B.Sc in Computer Science & Engineering at Bangladesh University of Business and Technology (BUBT) and has built 9+ projects spanning web apps, mobile apps, IoT, and machine learning."
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
                    "text": "Zahid is currently pursuing a B.Sc in Computer Science & Engineering at Bangladesh University of Business and Technology (BUBT), with a focus on AI, Machine Learning, and Software Development. He won a Software Development Competition in 2024 and completed a Data Analysis Internship at Tech Solutions Ltd. in 2022."
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
        {/* ProfessionalService / LocalBusiness Schema — ranks for local Dhaka & Bangladesh dev searches */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "@id": "https://zahidhasantonmoy.vercel.app/#service",
              "name": "Zahid Hasan Tonmoy - Full Stack & AI Solutions",
              "image": "https://zahidhasantonmoy.vercel.app/images/profile.jpg",
              "url": "https://zahidhasantonmoy.vercel.app",
              "telephone": "+8801850077786",
              "email": "zahidhasantonmoy.dev@gmail.com",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Mirpur",
                "addressLocality": "Dhaka",
                "addressRegion": "Dhaka Division",
                "postalCode": "1216",
                "addressCountry": "BD"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 23.8103,
                "longitude": 90.4125
              },
              "areaServed": [
                { "@type": "Country", "name": "Bangladesh" },
                { "@type": "Country", "name": "United States" },
                { "@type": "Country", "name": "United Kingdom" },
                { "@type": "AdministrativeArea", "name": "Worldwide" }
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Software & AI Development Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "MERN Full Stack Web Development",
                      "description": "Production-ready web applications using MongoDB, Express.js, React, Node.js, Next.js, and TypeScript."
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "AI Agent & Machine Learning Solutions",
                      "description": "Custom LLM integrations, autonomous AI agents, regression & classification models, and data analytics."
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Flutter Mobile App Development",
                      "description": "Cross-platform mobile applications with Supabase/Firebase backend."
                    }
                  }
                ]
              }
            })
          }}
        />
        <Providers>
          <ClientNavbar />
          {children}
          <ClientFooter />
          <ClientChatBot />
          <ClientResumeLeadDrawer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
