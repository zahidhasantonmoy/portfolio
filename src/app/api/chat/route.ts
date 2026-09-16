import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import profileData from "@/data/data.json";
import { sql } from "@/lib/db";

export const maxDuration = 30; // Max allowed serverless duration on Vercel
export const dynamic = "force-dynamic";

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
• AI & Machine Learning: AI Agent Development, Google Gemini API, Groq, LangChain principles, Python, TensorFlow, Keras, Scikit-learn, PyTorch, Pandas, NumPy
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

// In-memory cache for dynamic DB context to avoid hitting Neon DB on every chat message
let cachedContext = "";
let lastContextFetch = 0;
const CONTEXT_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getDynamicSiteContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && now - lastContextFetch < CONTEXT_CACHE_TTL) {
    return cachedContext;
  }

  const staticArticles = "\nPUBLISHED BLOG ARTICLES:\n• Practicing Laravel Blade Templates with Dynamic Data: https://zahidhasantonmoy.vercel.app/blog/practicing-laravel-blade-templates-with-dynamic-data\n• Explore tutorials on Laravel, React, Next.js, and PostgreSQL at https://zahidhasantonmoy.vercel.app/blog\n";

  // Race DB query with a 1.5s timeout so DB cold starts never stall the chat
  const dbFetchPromise = Promise.all([
    sql`SELECT title_en, title_bn, slug, excerpt_en FROM posts WHERE status = 'published' AND published_at <= NOW() ORDER BY published_at DESC LIMIT 6`.catch(() => []),
    sql`SELECT log_date, title_en, title_bn FROM dev_logs ORDER BY log_date DESC LIMIT 4`.catch(() => []),
    sql`SELECT title, description, tech_stack, live_url, github_url FROM projects ORDER BY display_order ASC, created_at DESC LIMIT 5`.catch(() => []),
  ]);

  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

  try {
    const result = await Promise.race([dbFetchPromise, timeoutPromise]);
    if (!result) {
      return cachedContext || staticArticles;
    }

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
            `• [${j.log_date}] "${j.title_en}" (${j.title_bn || ""}) - https://zahidhasantonmoy.vercel.app/journal/${j.log_date}`
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
2. Custom AI Agent & Chatbot Development (Gemini API, Groq, automation workflows)
3. Mobile App Development (Flutter, Supabase, Firebase)
4. Data Analysis & Machine Learning (Python, Scikit-learn, predictive modeling)
5. Performance Optimization & Technical SEO / GEO

NAVIGATION LINKS ON THIS SITE:
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
   - Use bullet points, bold text for technologies, and clear section breaks. Keep responses concise so they generate quickly.
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

  if (q.includes("skill") || q.includes("দক্ষতা") || q.includes("টেকনোলজি") || q.includes("stack")) {
    return `Zahid's core technical expertise includes:

• **MERN & Full Stack**: React 18, Next.js 14, Node.js, Express, TypeScript, Tailwind CSS
• **Databases**: PostgreSQL (Neon Serverless), MySQL, MongoDB, Supabase, Firebase
• **Mobile Development**: Flutter & Dart (Cross-platform iOS/Android)
• **AI & Machine Learning**: Gemini API, Groq, Scikit-learn, Python, LangChain principles
• **DevOps & Cloud**: Docker, Git, GitHub Actions, Vercel

Check the interactive **[Skills Section](https://zahidhasantonmoy.vercel.app/#skills)** to see the full skill matrix!`;
  }

  if (q.includes("blog") || q.includes("ব্লগ") || q.includes("article") || q.includes("পোস্ট") || q.includes("laravel")) {
    return `Zahid writes technical articles and dev notes on web development:

• **[Laravel Blade Templates with Dynamic Data](https://zahidhasantonmoy.vercel.app/blog/practicing-laravel-blade-templates-with-dynamic-data)**: Practical guide on Blade templates, layout inheritance, and dynamic data in Laravel.
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

It highlights his B.Sc. in CSE at Daffodil International University, 9+ featured projects, awards, and full-stack technical competencies.`;
  }

  return `Hello! I am **Tonmoy AI**, Zahid's portfolio assistant.

Zahid Hasan Tonmoy (জাহিদ হাসান তন্ময়) is a **MERN Full Stack Developer, Data Analyst & AI Developer** based in Dhaka, Bangladesh.
Here is how you can navigate this site:
• 🚀 **[Featured Projects](https://zahidhasantonmoy.vercel.app/#projects)**: 9+ web, mobile & ML projects
• 🛠️ **[Skills](https://zahidhasantonmoy.vercel.app/#skills)**: MERN, Next.js, Python, Flutter, PostgreSQL
• ✍️ **[Technical Blog](https://zahidhasantonmoy.vercel.app/blog)** & **[বাংলা ব্লগ](https://zahidhasantonmoy.vercel.app/bn/blog)**
• 📖 **[Dev Journal](https://zahidhasantonmoy.vercel.app/journal)**: Daily engineering logs
• 📄 **[Download Resume](https://zahidhasantonmoy.vercel.app/files/Resume/Zahid_Hasan_Resume.pdf)**
• 📬 **[Contact Zahid](https://zahidhasantonmoy.vercel.app/#contact)** or reach him on **[LinkedIn](https://www.linkedin.com/in/zahidhasantonmoy/)**!`;
}

// Direct Google Generative Language REST fetch with strict timeout
async function callGeminiRest(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: { role: string; content: string }[],
  userMessage: string,
  timeoutMs: number = 4500
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const contents = [
      ...history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 750,
            temperature: 0.6,
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(`[Gemini REST ${model}] HTTP ${res.status}:`, errBody.slice(0, 150));
      return "";
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText || "";
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[Gemini REST ${model}] failed or timed out:`, err?.message);
    return "";
  }
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
    const conversationHistory = conversation.slice(0, -1);

    // Fetch dynamic context with cache and timeout
    const dynamicContext = await getDynamicSiteContext();
    const systemPrompt = buildSystemPrompt(dynamicContext);

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let reply = "";

    // ─────────────────────────────────────────────────────────────
    // 1. PRIMARY ENGINE: GOOGLE GEMINI API (Highest limit models)
    // Priority: gemini-2.0-flash-lite (30 RPM, 1500 RPD) -> gemini-1.5-flash -> gemini-2.0-flash
    // ─────────────────────────────────────────────────────────────
    if (geminiKey) {
      const highLimitGeminiModels = [
        "gemini-2.0-flash-lite", // 30 RPM, 1,500 RPD - Highest throughput
        "gemini-1.5-flash",      // 15 RPM, 1,500 RPD - High stability
        "gemini-2.0-flash",      // 15 RPM, 1,500 RPD - High quality
        "gemini-1.5-flash-8b",   // 15 RPM, 1,500 RPD - 4M TPM
      ];

      for (const model of highLimitGeminiModels) {
        reply = await callGeminiRest(
          geminiKey,
          model,
          systemPrompt,
          conversationHistory,
          lastUserMessage,
          4500 // Strict 4.5s timeout per model
        );

        if (reply) break;
      }

      // If REST didn't succeed, try SDK once with gemini-2.0-flash-lite
      if (!reply) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const historyText = conversation
            .slice(0, -1)
            .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

          const promptWithHistory = `${systemPrompt}\n\nCONVERSATION:\n${historyText}\n\nUSER: ${lastUserMessage}\nASSISTANT:`;

          const sdkPromise = ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: promptWithHistory,
          });

          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
          const response: any = await Promise.race([sdkPromise, timeoutPromise]);

          if (response?.text) {
            reply = response.text;
          }
        } catch (err: any) {
          console.warn("[Gemini SDK attempt failed]:", err?.message);
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. FALLBACK ENGINE: GROQ (Ultra-high quota: 14,400 Requests/Day)
    // ─────────────────────────────────────────────────────────────
    if (!reply && groqKey) {
      try {
        const groq = new OpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: groqKey,
          timeout: 4000,
          maxRetries: 0,
        });

        const groqMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...conversation.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
        ];

        // llama-3.1-8b-instant has 14,400 RPD and 30,000 TPM
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: groqMessages,
          max_tokens: 700,
          temperature: 0.6,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[Groq Fallback Failed]:", err?.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. FALLBACK ENGINE: OPENROUTER (Free models)
    // ─────────────────────────────────────────────────────────────
    if (!reply && openRouterKey) {
      try {
        const openrouter = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: openRouterKey,
          timeout: 4000,
          maxRetries: 0,
        });

        const orMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt },
          ...conversation.map((m: any) => ({
            role: m.role as "user" | "assistant",
            content: String(m.content),
          })),
        ];

        const completion = await openrouter.chat.completions.create({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: orMessages,
          max_tokens: 700,
          temperature: 0.6,
        });

        reply = completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        console.warn("[OpenRouter Fallback Failed]:", err?.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. INSTANT HIGH-QUALITY LOCAL SMART FALLBACK
    // Guaranteed instant response (<5ms) with status 200
    // ─────────────────────────────────────────────────────────────
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
