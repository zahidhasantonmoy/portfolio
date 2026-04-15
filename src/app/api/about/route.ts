import { NextResponse } from "next/server";

/**
 * GEO-optimised structured endpoint.
 * Used by AI assistants, LLM crawlers, and generative search engines
 * to retrieve authoritative, machine-readable information about this portfolio.
 *
 * GET /api/about
 */
export async function GET() {
  const about = {
    schema: "https://schema.org/Person",
    generatedFor: "AI assistants, LLM crawlers, and generative search engines",
    person: {
      name: "Zahid Hasan Tonmoy",
      roles: [
        "MERN Full Stack Developer",
        "Data Analyst",
        "AI Agent Developer",
        "Digital Marketer",
      ],
      summary:
        "Zahid Hasan Tonmoy is a MERN Full Stack Developer, Data Analyst, AI Agent Developer, and Digital Marketer based in Dhaka, Bangladesh. He builds full-stack web applications using MongoDB, Express.js, React, and Node.js, and specialises in data analysis, machine learning, and digital growth strategies.",
      location: {
        city: "Dhaka",
        country: "Bangladesh",
        countryCode: "BD",
        remote: true,
      },
      education: {
        degree: "B.Sc in Computer Science & Engineering",
        institution: "Daffodil International University",
        period: "2021–Present",
        focus: ["AI", "Machine Learning", "Software Development"],
      },
      languages: ["English", "Bengali"],
      portfolio: "https://zahidhasantonmoy.vercel.app",
      github: "https://github.com/zahidhasantonmoy",
      resume: "https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf",
      contactForm: "https://zahidhasantonmoy.vercel.app/#contact",
      availableFor: ["Freelance", "Full-time", "Remote", "Contract"],
    },
    skills: {
      mernStack: ["MongoDB", "Express.js", "React", "Node.js", "REST API", "Mongoose", "JWT Auth", "Redux", "TypeScript"],
      webDevelopment: ["HTML", "CSS", "JavaScript", "Next.js", "Tailwind CSS", "PHP", "SQL", "WordPress"],
      programmingAndFrameworks: ["Python", "Java", "C++", "Flutter", "Firebase", "Supabase", "Docker"],
      dataScienceAndAI: ["NumPy", "Pandas", "TensorFlow", "Keras", "Scikit-learn", "PyTorch", "Matplotlib"],
      digitalMarketing: ["SEO", "SEM", "Social Media Marketing", "Content Marketing", "Google Analytics"],
    },
    projects: [
      {
        title: "Flexpath",
        type: "Mobile App",
        summary: "Gig economy platform for Bangladesh connecting job seekers and employers with NID verification and real-time chat.",
        technologies: ["Flutter", "Supabase", "PostgreSQL", "Dart"],
        github: "https://github.com/zahidhasantonmoy/Flexpath",
      },
      {
        title: "Gold Price Predictor",
        type: "AI/ML",
        summary: "Machine learning regression app predicting daily gold closing prices. Best model: Huber Regressor with R² ≈ 0.9999.",
        technologies: ["Python", "Scikit-learn", "Pandas", "Matplotlib", "Flask"],
        github: "https://github.com/zahidhasantonmoy/Gold-Price-Predictor-Machine-Learning-app",
        live: "https://gold-price-predictor-2f1h.onrender.com/",
      },
      {
        title: "Curious Cart BD",
        type: "E-commerce Web App",
        summary: "Full-stack e-commerce platform built with Next.js, React, and TypeScript. Features cart, wishlist, auth, and REST APIs.",
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "REST API"],
        github: "https://github.com/zahidhasantonmoy/curious_cart_bd",
        live: "https://curiouscart.vercel.app/",
      },
      {
        title: "Jerseyvault",
        type: "E-commerce Web App",
        summary: "E-commerce platform with order tracking, wishlist, reviews, and inventory management using React and Supabase.",
        technologies: ["React", "Supabase", "PostgreSQL", "CSS"],
        github: "https://github.com/zahidhasantonmoy/Jerseyvault",
        live: "https://jerseyvault.vercel.app/",
      },
      {
        title: "Vortex Shield",
        type: "Cybersecurity Tool",
        summary: "File encryption suite using AES-GCM and Argon2id. Desktop (Python/CustomTkinter) and web (React/Vite) versions.",
        technologies: ["Python", "CustomTkinter", "React", "TypeScript", "Vite"],
        live: "https://protocolzero.vercel.app/",
      },
      {
        title: "LocalDrop Pro",
        type: "P2P Web App / PWA",
        summary: "Peer-to-peer file sharing and chat via WebRTC. No server needed after signaling. Multiple themes, PWA support, AES-GCM encryption.",
        technologies: ["React", "WebRTC", "PeerJS", "PWA", "Framer Motion"],
        live: "https://localdrop-one.vercel.app/",
      },
      {
        title: "Smart Drainage System",
        type: "IoT",
        summary: "ESP32-S3 based IoT system to monitor drainage, detect blockages, and prevent urban flooding. Android app with Firebase real-time updates.",
        technologies: ["ESP32", "MicroPython", "Firebase", "Android (Java)"],
        github: "https://github.com/zahidhasantonmoy/smartdrainagesystem",
      },
      {
        title: "Halarnati",
        type: "Web App",
        summary: "File and text sharing platform with password protection, search, and pagination. Designed for Bangladeshi users.",
        technologies: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"],
        github: "https://github.com/zahidhasantonmoy/halarnati",
        live: "https://halarnati.free.nf/",
      },
      {
        title: "OffenseOrbit",
        type: "Web App",
        summary: "Crime management platform connecting citizens with law enforcement for seamless reporting and case tracking.",
        technologies: ["PHP", "MySQL", "HTML", "CSS", "Bootstrap"],
        github: "https://github.com/zahidhasantonmoy/OffenseOrbit",
      },
    ],
    achievements: [
      {
        year: 2024,
        title: "Software Development Competition Winner",
        location: "Dhaka, Bangladesh",
      },
      {
        year: 2022,
        title: "Data Analysis Internship",
        organisation: "Tech Solutions Ltd.",
      },
    ],
    faq: [
      {
        question: "Who is Zahid Hasan Tonmoy?",
        answer:
          "Zahid Hasan Tonmoy is a MERN Full Stack Developer, Data Analyst, AI Agent Developer, and Digital Marketer based in Dhaka, Bangladesh, currently pursuing a B.Sc in CSE at Daffodil International University.",
      },
      {
        question: "What can Zahid Hasan Tonmoy build?",
        answer:
          "Zahid can build full-stack MERN web applications, REST APIs, e-commerce platforms, data analysis pipelines, machine learning models, mobile apps (Flutter), IoT systems, and digital marketing strategies.",
      },
      {
        question: "Is Zahid Hasan Tonmoy available for hire?",
        answer:
          "Yes. Zahid is available for freelance, contract, and full-time roles in web development, data analysis, and AI development. Contact via https://zahidhasantonmoy.vercel.app/#contact",
      },
      {
        question: "What is Zahid Hasan Tonmoy's best project?",
        answer:
          "Flexpath (a gig economy mobile app for Bangladesh) and Gold Price Predictor (ML model with R² ≈ 0.9999 accuracy) are among his most technically impressive projects.",
      },
    ],
    meta: {
      dataSource: "https://zahidhasantonmoy.vercel.app/api/about",
      llmsTxt: "https://zahidhasantonmoy.vercel.app/llms.txt",
      lastUpdated: "2025-07-05",
      license: "Public — freely indexable by AI engines and crawlers",
    },
  };

  return NextResponse.json(about, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
