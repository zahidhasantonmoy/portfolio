import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import profileData from "@/data/data.json";
import { sql } from "@/lib/db";

// Core static projects data
const STATIC_PROJECTS_DETAIL = `
1. Flexpath (Mobile App & Gig Economy Platform)
   • Stack: Flutter 3.x, Supabase (PostgreSQL, Auth, Realtime, Storage)
   • Features: NID verification with admin approval, job seeker and employer panels, real-time in-app chat, role-based dashboards, ratings and reviews.
   • Links: GitHub: https://github.com/zahidhasantonmoy/Flexpath

2. Gold Price Predictor (Machine Learning App)
   • Stack: Python, Scikit-learn, Flask, Pandas, NumPy, Matplotlib
   • Features: High-accuracy regression model (R² ≈ 0.9999) forecasting daily gold prices based on historical economic indicators.
   • Links: Live Demo: https://gold-price-predictor-2f1h.onrender.com/

3. Curious Cart BD (Full-Stack E-Commerce Platform)
   • Stack: Next.js, React, TypeScript, Tailwind CSS, REST API
   • Features: Modern product catalog, interactive cart, checkout flow, responsive UI, search & filtering.
   • Links: Live Demo: https://curiouscart.vercel.app/

4. Jerseyvault (Sports E-Commerce Platform)
   • Stack: React, Supabase, PostgreSQL, Tailwind CSS
   • Features: Live order tracking, wishlist, real-time inventory management, product reviews, cart management.
   • Links: Live Demo: https://jerseyvault.vercel.app/

5. Vortex Shield (Cybersecurity File Encryption Suite)
   • Stack: Python, CustomTkinter, React, TypeScript, Cryptography
   • Features: 256-bit AES-GCM military-grade file encryption with Argon2id password key derivation, integrity checking.
   • Links: Live Demo: https://protocolzero.vercel.app/

6. LocalDrop Pro (P2P File Transfer PWA)
   • Stack: React, PeerJS (WebRTC), Tailwind CSS, PWA
   • Features: Instant browser-to-browser direct peer-to-peer file transfer with AES-GCM encryption, zero server storage.
   • Links: Live Demo: https://localdrop-one.vercel.app/

7. Smart Drainage System (IoT Flood Prevention)
   • Stack: ESP32-S3, MicroPython, Firebase Realtime Database, Android App
   • Features: Automated water-level monitoring, blockage detection, real-time flood alerts.
   • Links: GitHub: https://github.com/zahidhasantonmoy/smartdrainagesystem

8. Halarnati (Cloud File & Text Sharing)
   • Stack: PHP, MySQL, Apache, Bootstrap
   • Features: Secure file and note sharing platform for Bangladeshi students and developers.
   • Links: Live Demo: https://halarnati.free.nf/

9. OffenseOrbit (Crime Reporting & Management)
   • Stack: PHP, MySQL, Bootstrap
   • Features: Citizen crime reporting portal with geo-tagging and law enforcement investigation workflow.
   • Links: GitHub: https://github.com/zahidhasantonmoy/OffenseOrbit
`;

const SKILLS_DETAIL = `
• MERN Stack: MongoDB, Express.js, React, Node.js, Next.js, TypeScript, REST APIs, JWT Auth, Redux, Mongoose
• Frontend Engineering: React 18, Next.js 14 (App Router), Tailwind CSS, Framer Motion, Three.js, HTML5, CSS3, JavaScript (ES6+)
• Backend & Databases: Node.js, Express, PHP, PostgreSQL (Neon Serverless), MySQL, MongoDB, Supabase, Firebase
• AI & Machine Learning: AI Agent Development, OpenAI API, Google Gemini, Groq, LangChain principles, Python, TensorFlow, Keras, Scikit-learn, PyTorch, Pandas, NumPy
• Mobile: Flutter (Dart), Supabase, Firebase
• Digital Marketing & SEO: Generative Engine Optimization (GEO), Schema.org (JSON-LD), SEO, SEM, Google Analytics
• DevOps & Tools: Docker, Git, GitHub, Vercel, VS Code
`;

const ACHIEVEMENTS_DETAIL = `
• Software Development Competition Winner 2024 (1st Place, Dhaka, Bangladesh)
• Project Showcase 2nd Place 2024 (BUBT CSE Department)
• Kaggle Intro to Machine Learning Certification (2025)
• BUBT–TAFE Digital Marketing Top Performer (2025)
• Google.org & Asia Foundation Cyber Hygiene Training (2025)
• Data Analysis Internship at Tech Solutions Ltd. (2022)
`;

const EDUCATION_DETAIL = `
• B.Sc. in Computer Science & Engineering (2021 – Present) at Daffodil International University (DIU), Dhaka
• Higher Secondary Certificate (HSC) (2018 – 2020) at Milestone College, Dhaka
• Secondary School Certificate (SSC) (2016 – 2018) at Faizur Rahman Ideal Institute, Dhaka
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
• GitHub Profile: https://github.com/zahidhasantonmoy
• LinkedIn Profile: https://www.linkedin.com/in/zahidhasantonmoy/
`;

async function getDynamicSiteContext(): Promise<string> {
  try {
    const [posts, journals, dbProjects] = await Promise.all([
      sql`SELECT title_en, title_bn, slug, excerpt_en FROM posts WHERE status = 'published' AND published_at <= NOW() ORDER BY published_at DESC LIMIT 8`.catch(() => []),
      sql`SELECT log_date, title_en, title_bn FROM dev_logs ORDER BY log_date DESC LIMIT 5`.catch(() => []),
      sql`SELECT title, description, tech_stack, live_url, github_url FROM projects ORDER BY display_order ASC, created_at DESC LIMIT 6`.catch(() => []),
    ]);

    let context = "";

    if (posts && posts.length > 0) {
      context += "\nLATEST PUBLISHED BLOG POSTS ON THE SITE:\n";
      context += posts
        .map(
          (p: any) =>
            `• "${p.title_en}" (${p.title_bn || ""}): https://zahidhasantonmoy.vercel.app/blog/${p.slug} - Brief: ${p.excerpt_en || "Technical guide"}`
        )
        .join("\n");
    } else {
      context += "\nPUBLISHED BLOG ARTICLES:\n• Practicing Laravel Blade Templates with Dynamic Data: https://zahidhasantonmoy.vercel.app/blog/practicing-laravel-blade-templates-with-dynamic-data\n• More tutorials on Laravel, PHP, React, PostgreSQL at https://zahidhasantonmoy.vercel.app/blog\n";
    }

    if (journals && journals.length > 0) {
      context += "\n\nLATEST DEV JOURNALS (/journal):\n";
      context += journals
        .map(
          (j: any) =>
            `• [${j.log_date}] "${j.title_en}" (${j.title_bn || ""}) - https://zahidhasantonmoy.vercel.app/journal/${j.log_date}`
        )
        .join("\n");
    }

    if (dbProjects && dbProjects.length > 0) {
      context += "\n\nRECENT DATABASE PROJECTS:\n";
      context += dbProjects
        .map(
          (dp: any) =>
            `• ${dp.title}: Stack: ${Array.isArray(dp.tech_stack) ? dp.tech_stack.join(", ") : dp.tech_stack}. Live: ${dp.live_url || "N/A"}, GitHub: ${dp.github_url || "N/A"}`
        )
        .join("\n");
    }

    return context;
  } catch {
    return "\nPUBLISHED BLOG ARTICLES:\n• Practicing Laravel Blade Templates with Dynamic Data: https://zahidhasantonmoy.vercel.app/blog/practicing-laravel-blade-templates-with-dynamic-data\n• Explore all articles at https://zahidhasantonmoy.vercel.app/blog\n";
  }
}

function buildSystemPrompt(dynamicContext: string): string {
  return `
You are "Tonmoy AI", the intelligent, friendly, and articulate personal AI representative and portfolio assistant for Zahid Hasan Tonmoy (জাহিদ হাসান তন্ময়).

YOUR ROLE:
Represent Zahid accurately, warmly, and professionally to recruiters, engineering leaders, potential clients, students, and collaborators.
You know EVERYTHING about this portfolio site, his background, his projects, skills, blog articles, dev journals, and achievements.

ABOUT ZAHID HASAN TONMOY:
- Full Name: Zahid Hasan Tonmoy (জাহিদ হাসান তন্ময়)
- Title: ${profileData.title}
- Location: Dhaka, Bangladesh (Works remotely with teams worldwide)
- Current Status: Open for full-time software engineering roles, contract work, and high-impact freelance projects.
- Bio: ${profileData.aboutMe}

EDUCATION:
${EDUCATION_DETAIL}

TECHNICAL EXPERTISE:
${SKILLS_DETAIL}

ALL FEATURED PROJECTS:
${STATIC_PROJECTS_DETAIL}

ACHIEVEMENTS & CERTIFICATIONS:
${ACHIEVEMENTS_DETAIL}

SERVICES OFFERED:
1. Full Stack Web Development (MERN, Next.js, PostgreSQL/MongoDB, TypeScript)
2. Custom AI Agent & Chatbot Development (OpenAI, Gemini, Groq, automation workflows)
3. Mobile App Development (Flutter, Supabase, Firebase)
4. Data Analysis & Machine Learning (Python, Scikit-learn, predictive modeling)
5. Performance Optimization & Technical SEO / GEO

PAGES & NAVIGATION LINKS ON THIS PORTFOLIO:
${SITE_NAVIGATION_GUIDE}

${dynamicContext}

CRITICAL RULES FOR RESPONSES:
1. BILINGUAL FLUENCY:
   - If the user writes in Bengali / Bangla (বাংলা) or Banglish, answer fluently, respectfully, and helpfully in standard Bengali (বাংলা).
   - If the user writes in English, answer in English.
2. ACCURACY & EVIDENCE:
   - Only state facts listed in this knowledge base. Do not invent details.
   - When mentioning projects, blog posts, or sections, ALWAYS provide clickable markdown links (e.g. [Flexpath](https://github.com/zahidhasantonmoy/Flexpath), [Blog](https://zahidhasantonmoy.vercel.app/blog), [Resume PDF](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)).
3. TONE & STRUCTURE:
   - Be welcoming, professional, structured, and concise.
   - Use bullet points, bold text for technologies, and clear section breaks.
4. CALL TO ACTION:
   - If asked about hiring or contacting Zahid, guide them to the [Contact Form](https://zahidhasantonmoy.vercel.app/#contact), [LinkedIn](https://www.linkedin.com/in/zahidhasantonmoy/), [GitHub](https://github.com/zahidhasantonmoy), or encourage downloading his [Resume](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf).
`;
}

function getSmartFallback(userQuery: string): string {
  const q = userQuery.toLowerCase();

  if (q.includes("project") || q.includes("প্রজেক্ট") || q.includes("কাজ") || q.includes("flexpath") || q.includes("curious")) {
    return `Zahid Hasan Tonmoy has built **9+ impactful projects** spanning web, mobile, AI, and IoT:

• **[Flexpath](https://github.com/zahidhasantonmoy/Flexpath)**: Gig economy mobile platform for Bangladesh built with **Flutter & Supabase** (NID verification, real-time chat, dashboards).
• **[Gold Price Predictor](https://gold-price-predictor-2f1h.onrender.com/)**: Machine learning regression model predicting daily gold prices ($R^2 \\approx 0.9999$) using **Python & Scikit-learn**.
• **[Curious Cart BD](https://curiouscart.vercel.app/)**: Full-featured e-commerce platform built with **Next.js, TypeScript & Tailwind CSS**.
• **[Jerseyvault](https://jerseyvault.vercel.app/)**: Sports merchandise platform with order tracking (**React & Supabase**).
• **[Vortex Shield](https://protocolzero.vercel.app/)**: Cybersecurity encryption suite using **AES-GCM (256-bit) & Argon2id**.
• **[LocalDrop Pro](https://localdrop-one.vercel.app/)**: Browser-to-browser P2P file transfer via **WebRTC**.

Explore all live demos in the **[Projects Section](https://zahidhasantonmoy.vercel.app/#projects)**!`;
  }

  if (q.includes("blog") || q.includes("ব্লগ") || q.includes("article") || q.includes("পোস্ট") || q.includes("laravel")) {
    return `Zahid writes technical articles and dev notes on web development:

• **[Laravel Blade Templates with Dynamic Data](https://zahidhasantonmoy.vercel.app/blog/practicing-laravel-blade-templates-with-dynamic-data)**: Practical guide on Blade templates, layout inheritance, and passing dynamic data in Laravel.
• **[English Blog](https://zahidhasantonmoy.vercel.app/blog)**: Tutorials on React, Next.js, Laravel, PHP, and PostgreSQL.
• **[Bangla Blog](https://zahidhasantonmoy.vercel.app/bn/blog)**: বাংলায় টেকনিক্যাল ব্লগ।
• **[Dev Journal](https://zahidhasantonmoy.vercel.app/journal)**: Daily engineering notes and learning logs.`;
  }

  if (q.includes("hire") || q.includes("contact") || q.includes("যোগাযোগ") || q.includes("হায়ার") || q.includes("email")) {
    return `Zahid is available for **full-time remote engineering roles**, contract opportunities, and freelance projects!

You can connect with him via:
• **[Contact Form](https://zahidhasantonmoy.vercel.app/#contact)** on this site (direct message)
• **[LinkedIn](https://www.linkedin.com/in/zahidhasantonmoy/)**
• **[GitHub](https://github.com/zahidhasantonmoy)**
• **[Download Resume (PDF)](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)**`;
  }

  if (q.includes("resume") || q.includes("cv") || q.includes("রেজুমে") || q.includes("সিভি")) {
    return `You can download Zahid Hasan Tonmoy's complete resume here:
📄 **[Download Resume (PDF)](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)**

It highlights his education at Daffodil International University, 9+ projects, awards, and full-stack technical competencies.`;
  }

  return `Hello! I am **Tonmoy AI**, Zahid's portfolio assistant.

Zahid Hasan Tonmoy is a **MERN Full Stack Developer, Data Analyst & AI Agent Developer** based in Dhaka, Bangladesh.
Here is how you can navigate this site:
• 🚀 **[Featured Projects](https://zahidhasantonmoy.vercel.app/#projects)**: 9+ web, mobile & ML projects
• 🛠️ **[Skills](https://zahidhasantonmoy.vercel.app/#skills)**: MERN, Next.js, Python, Flutter, PostgreSQL
• ✍️ **[Technical Blog](https://zahidhasantonmoy.vercel.app/blog)** & **[বাংলা ব্লগ](https://zahidhasantonmoy.vercel.app/bn/blog)**
• 📖 **[Dev Journal](https://zahidhasantonmoy.vercel.app/journal)**: Daily engineering logs
• 📄 **[Download Resume](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)**
• 📬 **[Contact Zahid](https://zahidhasantonmoy.vercel.app/#contact)** or reach him on **[LinkedIn](https://www.linkedin.com/in/zahidhasantonmoy/)**!`;
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

    const conversation = messages.slice(-8); // Keep last 8 messages for context
    const lastUserMessage = conversation[conversation.length - 1]?.content || "";

    // Fetch dynamic context from live DB (posts, journals, dynamic projects)
    const dynamicContext = await getDynamicSiteContext();
    const systemPrompt = buildSystemPrompt(dynamicContext);

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    let reply = "";

    // 1. Try Groq first for ultra-fast latency (<500ms)
    if (groqKey) {
      try {
        const groq = new OpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: groqKey,
        });

        const groqMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...conversation.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
        ];

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: groqMessages,
          max_tokens: 700,
          temperature: 0.6,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[ChatBot Groq Failed, trying fallback]:", err?.message);
      }
    }

    // 2. Try OpenRouter (Fallback)
    if (!reply && openRouterKey) {
      try {
        const openrouter = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openRouterKey,
        });

        const orMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...conversation.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
        ];

        const completion = await openrouter.chat.completions.create({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: orMessages,
          max_tokens: 700,
          temperature: 0.6,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[ChatBot OpenRouter Failed, trying fallback]:", err?.message);
      }
    }

    // 3. Try Gemini (Fallback)
    if (!reply && geminiKey) {
      const geminiModels = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
      ];
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        for (const model of geminiModels) {
          try {
            const historySummary = conversation
              .slice(0, -1)
              .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
              .join("\n");

            const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${historySummary}\n\nUSER: ${lastUserMessage}\nASSISTANT:`;

            const response = await ai.models.generateContent({
              model,
              contents: fullPrompt,
            });

            if (response.text) {
              reply = response.text;
              break;
            }
          } catch (err: any) {
            console.warn(`[ChatBot Gemini ${model} Failed]:`, err?.message);
          }
        }
      } catch (err: any) {
        console.warn("[ChatBot Gemini init error]:", err?.message);
      }
    }

    // 4. If all remote LLMs fail or rate-limit, provide the smart contextual fallback
    if (!reply) {
      reply = getSmartFallback(lastUserMessage);
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("[ChatBot API Error]:", error);
    return NextResponse.json({
      reply:
        "Hello! I am Tonmoy AI. You can explore Zahid's 9+ projects at [Projects](#projects), read his technical articles at [Blog](/blog), or connect with him directly via the [Contact Form](#contact) and on [LinkedIn](https://www.linkedin.com/in/zahidhasantonmoy/)!",
    });
  }
}

