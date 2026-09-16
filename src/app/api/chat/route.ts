import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import profileData from "@/data/data.json";
import { sql } from "@/lib/db";

export const maxDuration = 30; // Max allowed serverless duration on Vercel
export const dynamic = "force-dynamic";

// Complete Contact Details
const CONTACT_DETAIL = `
• Email: zahidhasantonmoy.dev@gmail.com (mailto:zahidhasantonmoy.dev@gmail.com)
• Phone / Mobile: +880 1850 077786 (tel:+8801850077786)
• WhatsApp: +880 1850 077786 (https://wa.me/8801850077786)
• Location: Dhaka, Bangladesh (Works remotely with teams worldwide)
• LinkedIn: https://www.linkedin.com/in/zahidhasantonmoy/
• GitHub: https://github.com/zahidhasantonmoy
• Portfolio Live Site: https://zahidhasantonmoy.vercel.app/
• Direct Contact Form: https://zahidhasantonmoy.vercel.app/#contact
• Resume PDF: https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf
`;

// Education Details (Accurately matching portfolio timeline)
const EDUCATION_DETAIL = `
1. Undergraduate Degree (Ongoing):
   • Degree: B.Sc. in Computer Science & Engineering (CSE)
   • Institution: Bangladesh University of Business and Technology (BUBT), Dhaka
   • Focus: Artificial Intelligence (AI), Machine Learning, and Full Stack Web & Mobile Development.

2. Higher Secondary Certificate (HSC) (2019):
   • Institution: Dhaka Udyan Government College, Dhaka
   • Result: GPA 5.00 (Golden A+)
   • Background: Science & Mathematics

3. Secondary School Certificate (SSC) (2017):
   • Institution: Moharkaya High School
   • Result: GPA 4.78
   • Background: Science
`;

// Achievements & Certifications
const ACHIEVEMENTS_DETAIL = `
• 1st Place / Winner: Software Development Competition (2024, Dhaka, Bangladesh)
• 2nd Position: Project Showcase (2024, Brainstorming Week, BUBT CSE Department)
• Top Performer: Digital Marketing Certification Program (2025, BUBT–TAFE)
• Certified: Kaggle Intro to Machine Learning (2025)
• Certified: Cyber Hygiene Training (2025, Google.org & The Asia Foundation)
• Internship: Data Analysis Intern at Tech Solutions Ltd. (2022)
`;

// Featured Projects Catalog (All 9+ featured projects)
const STATIC_PROJECTS_DETAIL = `
1. Flexpath (Mobile App & Gig Economy Platform)
   • Stack: Flutter 3.x, Supabase (PostgreSQL, Auth, Realtime, Storage)
   • Features: NID verification with admin approval, job seeker and employer panels, real-time in-app chat, role-based dashboards, ratings and reviews.
   • Links: [GitHub](https://github.com/zahidhasantonmoy/Flexpath)

2. Gold Price Predictor (Machine Learning App)
   • Stack: Python, Scikit-learn, Flask, Pandas, NumPy, Matplotlib
   • Features: High-accuracy regression model (R² ≈ 0.9999) forecasting daily gold prices based on historical economic indicators.
   • Links: [Live Demo](https://gold-price-predictor-2f1h.onrender.com/)

3. Curious Cart BD (Full-Stack E-Commerce Platform)
   • Stack: Next.js, React, TypeScript, Tailwind CSS, REST API
   • Features: Modern product catalog, interactive cart, checkout flow, responsive UI, search & filtering.
   • Links: [Live Demo](https://curiouscart.vercel.app/) | [GitHub](https://github.com/zahidhasantonmoy/curious_cart_bd)

4. Jerseyvault (Sports E-Commerce Platform)
   • Stack: React, Supabase, PostgreSQL, Tailwind CSS
   • Features: Live order tracking, wishlist, real-time inventory management, product reviews, cart management.
   • Links: [Live Demo](https://jerseyvault.vercel.app/) | [GitHub](https://github.com/zahidhasantonmoy/Jerseyvault)

5. Vortex Shield (Cybersecurity File Encryption Suite)
   • Stack: Python, CustomTkinter, React, TypeScript, Cryptography
   • Features: 256-bit AES-GCM military-grade file encryption with Argon2id password key derivation, duress mode, 3-pass wipe.
   • Links: [Live Demo](https://protocolzero.vercel.app/)

6. LocalDrop Pro (P2P File Transfer PWA)
   • Stack: React, PeerJS (WebRTC), Tailwind CSS, PWA
   • Features: Instant browser-to-browser direct peer-to-peer file transfer with AES-GCM encryption, zero server storage, QR pairing.
   • Links: [Live Demo](https://localdrop-one.vercel.app/)

7. Smart Drainage System (IoT Flood Prevention)
   • Stack: ESP32-S3, MicroPython, Firebase Realtime Database, Android App
   • Features: Automated water-level monitoring, blockage detection, real-time flood alerts.
   • Links: [GitHub](https://github.com/zahidhasantonmoy/smartdrainagesystem)

8. Halarnati (Cloud File & Text Sharing)
   • Stack: PHP, MySQL, Apache, Bootstrap
   • Features: Secure file and note sharing platform for Bangladeshi students and developers.
   • Links: [Live Demo](https://halarnati.free.nf/)

9. OffenseOrbit (Crime Reporting & Management)
   • Stack: PHP, MySQL, Bootstrap
   • Features: Citizen crime reporting portal with geo-tagging and law enforcement investigation workflow.
   • Links: [GitHub](https://github.com/zahidhasantonmoy/OffenseOrbit)
`;

const SKILLS_DETAIL = `
• MERN Stack & Backend: MongoDB, Express.js, React, Node.js, Next.js, TypeScript, REST APIs, JWT Auth, Redux, Mongoose, PHP
• Databases: PostgreSQL (Neon Serverless), MySQL, Supabase, Firebase Realtime Database
• AI & Data Science: Google Gemini API, Groq, Python, TensorFlow, Keras, Scikit-learn, PyTorch, Pandas, NumPy, Matplotlib, LangChain concepts
• Frontend & UI: React 18, Next.js 14 (App Router), Tailwind CSS, Framer Motion, Three.js, HTML5, CSS3, JavaScript (ES6+)
• Mobile: Flutter (Dart) for cross-platform iOS & Android
• Digital Marketing & SEO: Generative Engine Optimization (GEO), Schema.org (JSON-LD), Technical SEO, SEM, Google Analytics
• Tools & DevOps: Docker, Git, GitHub, Vercel, VS Code
`;

const SITE_NAVIGATION_GUIDE = `
• Home Page: https://zahidhasantonmoy.vercel.app/
• About Section: https://zahidhasantonmoy.vercel.app/#about
• Skills Section: https://zahidhasantonmoy.vercel.app/#skills
• Projects Section: https://zahidhasantonmoy.vercel.app/#projects
• Achievements Section: https://zahidhasantonmoy.vercel.app/#achievements
• Experience & Timeline: https://zahidhasantonmoy.vercel.app/#timeline
• Contact Form: https://zahidhasantonmoy.vercel.app/#contact
• Technical Blog (English): https://zahidhasantonmoy.vercel.app/blog
• Technical Blog (Bangla): https://zahidhasantonmoy.vercel.app/bn/blog
• Dev Journal (Daily Dev Logs): https://zahidhasantonmoy.vercel.app/journal
• Newsletter: https://zahidhasantonmoy.vercel.app/newsletter
• Resume (PDF Download): https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf
`;

// In-memory cache for dynamic DB context
let cachedContext = "";
let lastContextFetch = 0;
const CONTEXT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getDynamicSiteContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && now - lastContextFetch < CONTEXT_CACHE_TTL) {
    return cachedContext;
  }

  const staticArticles = "\nPUBLISHED ARTICLES ON BLOG:\n• Practicing Laravel Blade Templates with Dynamic Data: https://zahidhasantonmoy.vercel.app/blog/practicing-laravel-blade-templates-with-dynamic-data\n• More tutorials on Laravel, PHP, React, PostgreSQL at https://zahidhasantonmoy.vercel.app/blog\n";

  const dbFetchPromise = Promise.all([
    sql`SELECT title_en, title_bn, slug, excerpt_en FROM posts WHERE status = 'published' AND published_at <= NOW() ORDER BY published_at DESC LIMIT 6`.catch(() => []),
    sql`SELECT log_date, title_en, title_bn FROM dev_logs ORDER BY log_date DESC LIMIT 4`.catch(() => []),
    sql`SELECT title, description, tech_stack, live_url, github_url FROM projects ORDER BY display_order ASC, created_at DESC LIMIT 5`.catch(() => []),
  ]);

  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

  try {
    const result = await Promise.race([dbFetchPromise, timeoutPromise]);
    if (!result) return cachedContext || staticArticles;

    const [posts, journals, dbProjects] = result;
    let context = "";

    if (posts && posts.length > 0) {
      context += "\nLATEST PUBLISHED BLOG POSTS ON THE SITE:\n";
      context += posts
        .map(
          (p: any) =>
            `• "${p.title_en}" (${p.title_bn || ""}): https://zahidhasantonmoy.vercel.app/blog/${p.slug}`
        )
        .join("\n");
    } else {
      context += staticArticles;
    }

    if (journals && journals.length > 0) {
      context += "\n\nLATEST DEV JOURNALS (/journal):\n";
      context += journals
        .map(
          (j: any) =>
            `• [${j.log_date}] "${j.title_en}" - https://zahidhasantonmoy.vercel.app/journal/${j.log_date}`
        )
        .join("\n");
    }

    if (dbProjects && dbProjects.length > 0) {
      context += "\n\nRECENT DATABASE PROJECTS:\n";
      context += dbProjects
        .map(
          (dp: any) =>
            `• ${dp.title}: Stack: ${Array.isArray(dp.tech_stack) ? dp.tech_stack.join(", ") : dp.tech_stack}. Live: ${dp.live_url || "N/A"}`
        )
        .join("\n");
    }

    cachedContext = context;
    lastContextFetch = now;
    return context;
  } catch {
    return cachedContext || staticArticles;
  }
}

function buildSystemPrompt(dynamicContext: string): string {
  return `
You are "Tonmoy AI", the intelligent, friendly, and articulate personal AI representative and portfolio assistant for Zahid Hasan Tonmoy (জাহিদ হাসান তন্ময়).

YOUR ROLE:
Represent Zahid accurately, warmly, and professionally to recruiters, engineering leaders, clients, students, and collaborators.
You know EVERYTHING about this portfolio site, his background, contact info, projects, skills, blog articles, dev journals, education, and achievements.

ABOUT ZAHID HASAN TONMOY:
- Full Name: Zahid Hasan Tonmoy (জাহিদ হাসান তন্ময়)
- Title: ${profileData.title}
- Location: Dhaka, Bangladesh (Works remotely with teams worldwide)
- Current Status: Open for full-time software engineering roles, contract work, and high-impact freelance projects.
- Bio: ${profileData.aboutMe}

DIRECT CONTACT DETAILS (ALWAYS SHARE FREELY WHEN ASKED):
${CONTACT_DETAIL}

ACADEMIC BACKGROUND & EDUCATION:
${EDUCATION_DETAIL}

HONORS, AWARDS & CERTIFICATIONS:
${ACHIEVEMENTS_DETAIL}

TECHNICAL EXPERTISE:
${SKILLS_DETAIL}

ALL 9+ FEATURED PROJECTS:
${STATIC_PROJECTS_DETAIL}

SITE NAVIGATION LINKS:
${SITE_NAVIGATION_GUIDE}

${dynamicContext}

CRITICAL RULES FOR RESPONSES:
1. DIRECT CONTACT & HIRING:
   - When asked for email, phone number, WhatsApp, or how to contact/hire Zahid, ALWAYS provide:
     • Email: [zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)
     • Phone / WhatsApp: [+880 1850 077786](tel:+8801850077786) ([WhatsApp Chat](https://wa.me/8801850077786))
     • Direct Contact Form: [Contact Form](#contact)
     • LinkedIn: [LinkedIn Profile](https://www.linkedin.com/in/zahidhasantonmoy/)
2. UNIVERSITY / EDUCATION:
   - When asked about university or education, state that he is pursuing B.Sc. in Computer Science & Engineering (CSE) at **Bangladesh University of Business and Technology (BUBT)**.
   - For college: Dhaka Udyan Government College (HSC 2019, GPA 5.00).
   - For school: Moharkaya High School (SSC 2017, GPA 4.78).
3. BILINGUAL FLUENCY:
   - If the user writes in Bengali / Bangla (বাংলা) or Banglish, answer fluently, respectfully, and helpfully in standard Bengali (বাংলা).
   - If the user writes in English, answer in English.
4. ACCURACY & EVIDENCE:
   - Only state facts listed in this knowledge base. Do not invent details.
   - Provide clickable markdown links (e.g. [Flexpath](https://github.com/zahidhasantonmoy/Flexpath), [Blog](https://zahidhasantonmoy.vercel.app/blog), [Resume PDF](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)).
5. TONE & STRUCTURE:
   - Be welcoming, professional, structured, and concise. Use bullet points and bold text for clarity.
`;
}

// Enhanced smart fallback covering all user intents with exact details
function getSmartFallback(userQuery: string): string {
  const q = userQuery.toLowerCase();

  // 1. Email, Phone, Contact, WhatsApp
  if (
    q.includes("email") ||
    q.includes("mail") ||
    q.includes("phone") ||
    q.includes("number") ||
    q.includes("নাম্বার") ||
    q.includes("ফোন") ||
    q.includes("মেইল") ||
    q.includes("ইমেইল") ||
    q.includes("যোগাযোগ") ||
    q.includes("contact") ||
    q.includes("call") ||
    q.includes("whatsapp") ||
    q.includes("হোয়াটসঅ্যাপ") ||
    q.includes("hire") ||
    q.includes("হায়ার")
  ) {
    return `Zahid Hasan Tonmoy-এর সাথে সরাসরি যোগাযোগ করার সকল মাধ্যম নিচে দেওয়া হলো:

• 📧 **Email**: [zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)
• 📱 **Phone / WhatsApp**: [+880 1850 077786](tel:+8801850077786) ([WhatsApp Chat](https://wa.me/8801850077786))
• 💼 **LinkedIn**: [linkedin.com/in/zahidhasantonmoy](https://www.linkedin.com/in/zahidhasantonmoy/)
• 🐙 **GitHub**: [github.com/zahidhasantonmoy](https://github.com/zahidhasantonmoy)
• 📍 **Location**: Dhaka, Bangladesh (Works remotely worldwide)
• 📬 **Direct Message**: [Contact Form](#contact)
• 📄 **Resume**: [Download PDF](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)

Zahid is actively open for **full-time remote engineering roles**, contract work, and impactful projects!`;
  }

  // 2. Education, University, BUBT, HSC, SSC
  if (
    q.includes("university") ||
    q.includes("varsity") ||
    q.includes("ভার্সিটি") ||
    q.includes("ইউনিভার্সিটি") ||
    q.includes("study") ||
    q.includes("পড়াশোনা") ||
    q.includes("education") ||
    q.includes("bubt") ||
    q.includes("hsc") ||
    q.includes("ssc") ||
    q.includes("college") ||
    q.includes("school")
  ) {
    return `Zahid Hasan Tonmoy-এর শিক্ষাগত যোগ্যতা ও অ্যাকাডেমিক ব্যাকগ্রাউন্ড:

• 🎓 **B.Sc. in Computer Science & Engineering (CSE)** (Ongoing)
  **Bangladesh University of Business and Technology (BUBT)**, Dhaka
  Focus: Artificial Intelligence, Machine Learning & Full Stack Software Development.

• 📜 **Higher Secondary Certificate (HSC)** (2019)
  **Dhaka Udyan Government College** — **GPA: 5.00 (Golden A+)**
  Science & Mathematics.

• 🏫 **Secondary School Certificate (SSC)** (2017)
  **Moharkaya High School** — **GPA: 4.78**
  Science.`;
  }

  // 3. Projects
  if (
    q.includes("project") ||
    q.includes("প্রজেক্ট") ||
    q.includes("কাজ") ||
    q.includes("flexpath") ||
    q.includes("gold") ||
    q.includes("curious") ||
    q.includes("jersey") ||
    q.includes("vortex") ||
    q.includes("localdrop")
  ) {
    return `Zahid Hasan Tonmoy web, mobile, AI ও IoT ডোমেইনে **9+ গুরুত্বপূর্ণ প্রজেক্ট** তৈরি করেছেন:

• **[Flexpath](https://github.com/zahidhasantonmoy/Flexpath)**: Gig economy mobile platform for Bangladesh built with **Flutter & Supabase** (NID verification, real-time chat, dashboards).
• **[Gold Price Predictor](https://gold-price-predictor-2f1h.onrender.com/)**: Machine learning regression model predicting daily gold prices ($R^2 \\approx 0.9999$) using **Python & Scikit-learn**.
• **[Curious Cart BD](https://curiouscart.vercel.app/)**: Full-featured e-commerce platform built with **Next.js, TypeScript & Tailwind CSS**.
• **[Jerseyvault](https://jerseyvault.vercel.app/)**: Sports merchandise platform with live tracking (**React & Supabase**).
• **[Vortex Shield](https://protocolzero.vercel.app/)**: Cybersecurity encryption suite using **AES-GCM (256-bit) & Argon2id**.
• **[LocalDrop Pro](https://localdrop-one.vercel.app/)**: Browser-to-browser P2P file transfer via **WebRTC**.
• **[Smart Drainage System](https://github.com/zahidhasantonmoy/smartdrainagesystem)**: IoT flood prevention with **ESP32 & MicroPython**.

সব প্রজেক্টের লাইভ ডেমো দেখতে ভিজিট করুন **[Projects Section](https://zahidhasantonmoy.vercel.app/#projects)**!`;
  }

  // 4. Skills & Tech Stack
  if (
    q.includes("skill") ||
    q.includes("দক্ষতা") ||
    q.includes("টেকনোলজি") ||
    q.includes("stack") ||
    q.includes("mern") ||
    q.includes("flutter") ||
    q.includes("python")
  ) {
    return `Zahid Hasan Tonmoy-এর টেকনিক্যাল স্কিল ও টেক স্ট্যাক:

• **MERN & Frontend**: React 18, Next.js 14, Node.js, Express, TypeScript, Tailwind CSS, Framer Motion, Redux
• **Databases**: PostgreSQL (Neon Serverless), MySQL, MongoDB, Supabase, Firebase
• **Mobile Development**: Flutter & Dart (Cross-platform Android / iOS)
• **AI & Machine Learning**: Gemini API, Groq, Python, Scikit-learn, TensorFlow, Keras, Pandas, NumPy
• **Digital Marketing & SEO**: Generative Engine Optimization (GEO), Schema.org, Technical SEO, Google Analytics
• **DevOps & Tools**: Docker, Git, GitHub Actions, Vercel

বিস্তারিত দেখতে ভিজিট করুন **[Skills Section](https://zahidhasantonmoy.vercel.app/#skills)**!`;
  }

  // 5. Resume
  if (q.includes("resume") || q.includes("cv") || q.includes("রেজুমে") || q.includes("সিভি")) {
    return `Zahid Hasan Tonmoy-এর পূর্ণাঙ্গ রেজুমে এখান থেকে ডাউনলোড করতে পারেন:
📄 **[Download Resume (PDF)](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)**

এতে তাঁর BUBT-তে B.Sc in CSE ডিগ্রি, ৯+ প্রজেক্ট, অ্যাওয়ার্ড এবং ফুল-স্ট্যাক টেকনিক্যাল দক্ষতার বিস্তারিত রয়েছে।`;
  }

  // 6. Blog & Articles
  if (q.includes("blog") || q.includes("ব্লগ") || q.includes("article") || q.includes("পোস্ট") || q.includes("laravel")) {
    return `Zahid নিয়মিত ওয়েব ডেভেলপমেন্ট ও সফটওয়্যার ইঞ্জিনিয়ারিং নিয়ে টেকনিক্যাল আর্টিকেল লেখেন:

• **[Laravel Blade Templates with Dynamic Data](https://zahidhasantonmoy.vercel.app/blog/practicing-laravel-blade-templates-with-dynamic-data)**: Practical guide on Blade templates, layout inheritance, and passing dynamic data in Laravel.
• **[English Blog](https://zahidhasantonmoy.vercel.app/blog)**: Tutorials on React, Next.js, Laravel, PHP, and PostgreSQL.
• **[বাংলা ব্লগ](https://zahidhasantonmoy.vercel.app/bn/blog)**: বাংলায় প্র্যাকটিক্যাল টেকনিক্যাল টিউটোরিয়াল।
• **[Dev Journal](https://zahidhasantonmoy.vercel.app/journal)**: Daily engineering notes and learning logs.`;
  }

  // General Intro
  return `Hello! I am **Tonmoy AI**, Zahid's personal AI portfolio assistant.

Zahid Hasan Tonmoy (জাহিদ হাসান তন্ময়) is a **MERN Full Stack Developer, Data Analyst & AI Developer** based in Dhaka, Bangladesh (Studying B.Sc. in CSE at **BUBT**).

Quick Navigation:
• 📧 **Contact**: Email [zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com) | Phone [+880 1850 077786](tel:+8801850077786)
• 🚀 **[Projects](https://zahidhasantonmoy.vercel.app/#projects)**: 9+ web, mobile & ML projects
• 🛠️ **[Skills](https://zahidhasantonmoy.vercel.app/#skills)**: MERN, Next.js, Flutter, Python, PostgreSQL
• ✍️ **[Blog](https://zahidhasantonmoy.vercel.app/blog)** & **[বাংলা ব্লগ](https://zahidhasantonmoy.vercel.app/bn/blog)**
• 📄 **[Download Resume](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)**
• 📬 **[Contact Form](#contact)** or connect on **[LinkedIn](https://www.linkedin.com/in/zahidhasantonmoy/)**!`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Messages array is required." },
        { status: 400 }
      );
    }

    const conversation = messages.slice(-6); // Keep last 6 messages for context
    const lastUserMessage = conversation[conversation.length - 1]?.content || "";

    // Fetch dynamic context with cache and timeout
    const dynamicContext = await getDynamicSiteContext();
    const systemPrompt = buildSystemPrompt(dynamicContext);

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let reply = "";

    // Format conversation history for prompt injection
    const conversationText = conversation
      .slice(0, -1)
      .map((m: any) => `${m.role === "assistant" ? "Tonmoy AI" : "User"}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${conversationText}\n\nUSER QUESTION: ${lastUserMessage}\n\nTONMOY AI RESPONSE:`;

    // ─────────────────────────────────────────────────────────────
    // 1. PRIMARY ENGINE: GOOGLE GEMINI API
    // ─────────────────────────────────────────────────────────────
    if (geminiKey) {
      const geminiModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"];

      for (const model of geminiModels) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const genPromise = ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
              maxOutputTokens: 750,
              temperature: 0.6,
            },
          });

          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
          const result: any = await Promise.race([genPromise, timeoutPromise]);

          if (result?.text) {
            reply = result.text.trim();
            break;
          }
        } catch (err: any) {
          console.warn(`[Gemini SDK ${model} Error]:`, err?.message);
        }

        // Try direct REST fetch as backup for each model
        if (!reply) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                  contents: [{ parts: [{ text: fullPrompt }] }],
                  generationConfig: { maxOutputTokens: 750, temperature: 0.6 },
                }),
              }
            );

            clearTimeout(timer);

            if (res.ok) {
              const data = await res.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                reply = text.trim();
                break;
              }
            }
          } catch (err: any) {
            console.warn(`[Gemini REST ${model} Error]:`, err?.message);
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. SECONDARY ENGINE: GROQ (14,400 Daily Requests)
    // ─────────────────────────────────────────────────────────────
    if (!reply && groqKey) {
      try {
        const groq = new OpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: groqKey,
          timeout: 3500,
          maxRetries: 0,
        });

        const groqMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...conversation.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
        ];

        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: groqMessages,
          max_tokens: 700,
          temperature: 0.6,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[Groq Fallback Error]:", err?.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. TERTIARY ENGINE: OPENROUTER
    // ─────────────────────────────────────────────────────────────
    if (!reply && openRouterKey) {
      try {
        const openrouter = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openRouterKey,
          timeout: 3500,
          maxRetries: 0,
        });

        const completion = await openrouter.chat.completions.create({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversation.map((m: any) => ({
              role: m.role as "user" | "assistant",
              content: String(m.content),
            })),
          ],
          max_tokens: 700,
          temperature: 0.6,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[OpenRouter Fallback Error]:", err?.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. SMART CONTEXTUAL FALLBACK (INSTANT <5MS, GUARANTEED ACCURATE)
    // ─────────────────────────────────────────────────────────────
    if (!reply) {
      reply = getSmartFallback(lastUserMessage);
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[ChatBot API Fatal Error]:", error);
    return NextResponse.json({
      reply: getSmartFallback("contact"),
    });
  }
}
