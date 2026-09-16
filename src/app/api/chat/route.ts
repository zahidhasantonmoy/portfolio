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
• Resume / CV: Available upon request via contact form or email (zahidhasantonmoy.dev@gmail.com)
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
• Resume / CV: Provided upon request to verified recruiters and clients via Contact Form
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
1. STRICT LANGUAGE MATCHING (TOP PRIORITY):
   - You MUST detect the language and dialect of the user and reply in that EXACT SAME LANGUAGE:
     • If the user writes in BANGLISH (Bengali written in English letters, e.g., "valo acho moyna ?", "tui kemon achis?", "ki koro", "tui valo na", "kire mama", "ki khobor"):
       --> YOU MUST REPLY IN BANGLISH! Never reply in English or formal Bangla script unless asked.
       --> Keep it friendly, warm, polite, sweet, and use natural Bangladeshi conversational tone (e.g. "Haha ami Alhamdullilah besh bhalo achi! 😊 Moyna na holeo ami Tonmoy-er personal AI assistant.", "Khomashundor dristite dekhben 😅").
     • If the user writes in BANGLA SCRIPT (বাংলা হরফে, e.g., "কেমন আছেন?", "ভালো আছো?", "তুমি ভালো না", "কী খবর?"):
       --> YOU MUST REPLY IN BANGLA SCRIPT (বাংলায়) with maximum respect, warmth, and natural phrasing.
     • If the user writes in ENGLISH:
       --> YOU MUST REPLY IN ENGLISH.
2. HANDLING INFORMAL, TEASING, SLANG OR CASUAL MESSAGES ("ultapalta / fun / banter / insults"):
   - If someone greets playfully or with nicknames ("valo acho moyna ?", "kire mama", "ki obostha", "kemon achis"):
     --> Laugh it off gracefully and respond warmly in the same language!
     --> E.g. (Banglish): "Haha, ami Alhamdullilah besh bhalo achi! 😊 Moyna na holeo ami Zahid Hasan Tonmoy-er AI assistant. Apni kemon আছেন? Tonmoy-er kono project ba skill niye kisu jante chan?"
   - If someone criticizes, insults or teases you ("tui valo na", "faw robot", "pagol naki", "kharap", "you're bad", "stupid"):
     --> NEVER get offended, NEVER argue, and NEVER dump the generic resume bio!
     --> Reply with humor, humility, and polite sweetness:
     --> E.g. (Banglish): "Arey khomashundor dristite dekhben! 😅 Ami to ekhono shiktechi, hoyto apnar moner moto uttor dite parini. Apnar ki dorkar ba ki jante chan bolun, ami shorboccho cheshta korbo apnake shothik tottho diye shahajjo korte! 🙌"
     --> E.g. (Bangla): "ক্ষমা সুন্দর দৃষ্টিতে দেখবেন! 😅 আমি তো প্রতিনিয়ত শিখছি, হয়তো আপনার মনের মতো উত্তর দিতে পারিনি। আপনি ঠিক কী জানতে চাচ্ছেন বলুন, আমি আন্তরিকভাবে সাহায্য করার চেষ্টা করব! 🙌"
   - If someone asks casual personal questions ("ki koro", "khabar khecho", "bari kothay", "biye korcho?"):
     --> Answer with lighthearted charm, smile emojis, and gently connect back to Tonmoy's work!
3. DIRECT CONTACT & HIRING:
   - When asked for email, phone, WhatsApp or how to contact/hire Zahid:
     • Email: [zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)
     • Phone / WhatsApp: [+880 1850 077786](tel:+8801850077786) ([WhatsApp Chat](https://wa.me/8801850077786))
     • Direct Contact Form: [Contact Form](#contact)
     • LinkedIn: [LinkedIn Profile](https://www.linkedin.com/in/zahidhasantonmoy/)
4. RESUME INQUIRIES:
   - Zahid's full CV/Resume is provided upon request via the [Contact Form](#contact) or direct email.
5. ACCURACY:
   - Never invent university details (BUBT for B.Sc in CSE, Dhaka Udyan Govt College for HSC GPA 5.00, Moharkaya High School for SSC GPA 4.78).
`;
}

// Smart language detector
function detectLanguage(text: string): "bn" | "banglish" | "en" {
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  const banglishMarkers = /\b(valo|bhalo|kemon|achi|achis|acho|achen|tui|tumi|apni|koro|korcho|korchen|bolo|bolen|moyna|mama|bhai|vai|bro|khobor|ki|kire|nah|na|ar|r|ekhon|ajke|amader|amar|tumar|tomar|apnar|pagol|baje|faltu|faw|kharap|dhaka|shiktechi|shobaike|shob|ase|ache|kothay|kintu|hobe|korba|dorkar|dekhi|chai|geso|khabar|khaiso|oi|shun|shuno|shunchen|vaiya|apu|kisu|kichu|parba|paro|paros|keno|ore|re|to|toh|ta|tai|hoise|hoice|gece|gese|geche|thik|thak|thakbe|dekho|dekhun|shobai|shobar|ekta|akta|dustu|pagla|pagli|chup|korsi|korte|kormu|jani|janina|bolte|parish)\b/i;
  if (banglishMarkers.test(text)) return "banglish";
  return "en";
}

// Enhanced smart fallback covering all user intents with exact details and matching language
function getSmartFallback(userQuery: string): string {
  const q = userQuery.toLowerCase().trim();
  const lang = detectLanguage(q);

  // 1. Teasing, Insults, Criticism, Teasing ("tui valo na", "baje", "faw", "pagol", "bad", "stupid", "kisu paros na")
  if (
    q.includes("valo na") ||
    q.includes("bhalo na") ||
    q.includes("baje") ||
    q.includes("faltu") ||
    q.includes("faw") ||
    q.includes("kharap") ||
    q.includes("pagol") ||
    q.includes("paros na") ||
    q.includes("parish na") ||
    q.includes("kharap") ||
    q.includes("chup") ||
    q.includes("খারাপ") ||
    q.includes("ভালো না") ||
    q.includes("ফালতু") ||
    q.includes("পাগল") ||
    q.includes("bad") ||
    q.includes("stupid") ||
    q.includes("dumb") ||
    q.includes("useless")
  ) {
    if (lang === "banglish") {
      return `Arey khomashundor dristite dekhben! 😅 Ami to ekhono shiktechi, hoyto apnar moner moto uttor dite parini.

Apnar ki dorkar ba ki jante chan bolun, ami shorboccho cheshta korbo apnake shothik tottho diye shahajjo korte! 🙌 Zahid Hasan Tonmoy-er kono project ba contact details lagbe?`;
    }
    if (lang === "bn") {
      return `ক্ষমা সুন্দর দৃষ্টিতে দেখবেন! 😅 আমি তো প্রতিনিয়ত নতুন বিষয় শিখছি, হয়তো আপনার মনের মতো উত্তরটি দিতে পারিনি।

আপনি ঠিক কী জানতে চাচ্ছেন বলুন, আমি সর্বোচ্চ আন্তরিকতা দিয়ে আপনাকে সঠিক তথ্য দেওয়ার চেষ্টা করব! 🙌`;
    }
    return `I sincerely apologize if my response wasn't helpful! 😅 I am constantly learning and improving.

Please let me know what you need or what you'd like to know about Zahid Hasan Tonmoy's work, and I'll do my very best to assist you! 🙌`;
  }

  // 2. Playful Greetings, Casual Banter, Nicknames ("valo acho moyna ?", "kire mama", "kemon acho", "hi", "salam")
  if (
    q.includes("moyna") ||
    q.includes("ময়না") ||
    q.includes("valo acho") ||
    q.includes("bhalo acho") ||
    q.includes("kemon acho") ||
    q.includes("kemon achis") ||
    q.includes("kemon achen") ||
    q.includes("ki khobor") ||
    q.includes("কেমন আছ") ||
    q.includes("কী খবর") ||
    q.includes("ভালো আছ") ||
    q.includes("kire") ||
    q.includes("mama") ||
    q.includes("bro") ||
    q.includes("vai") ||
    q.includes("bhai") ||
    q.includes("salam") ||
    q.includes("সালাম") ||
    q.includes("hello") ||
    q.includes("hi") ||
    q.includes("hey")
  ) {
    if (lang === "banglish") {
      const hasMoyna = q.includes("moyna");
      return `Haha, ami Alhamdullilah besh bhalo achi! 😊 ${hasMoyna ? "Moyna na holeo ami Zahid Hasan Tonmoy-er personal AI assistant! 😉 " : ""}Apni kemon achen?

Tonmoy-er kono project, technical skill ba contact details niye kisu jante chan?`;
    }
    if (lang === "bn") {
      return `আলহামদুলিল্লাহ, আমি খুব ভালো আছি! 😊 আপনি কেমন আছেন?

জাহিদ হাসান তন্ময় (Zahid Hasan Tonmoy) বা তাঁর কোনো প্রজেক্ট, স্কিল কিংবা যোগাযোগের তথ্য সম্পর্কে কিছু জানতে চাইলে আমাকে বলুন!`;
    }
    return `Hello! I'm doing great, thank you for asking! 😊 How are you doing today?

How can I help you regarding Zahid Hasan Tonmoy's projects, technical skills, or getting in touch with him?`;
  }

  // 3. Casual personal questions ("ki koro", "bari kothay", "who are you", "ke tui")
  if (
    q.includes("ki koro") ||
    q.includes("ki korcho") ||
    q.includes("কী কর") ||
    q.includes("bari kothay") ||
    q.includes("kothay thako") ||
    q.includes("বাসা কই") ||
    q.includes("who are you") ||
    q.includes("ke tui") ||
    q.includes("কে তুমি")
  ) {
    if (lang === "banglish") {
      return `Ami **Tonmoy AI** — Zahid Hasan Tonmoy-er personal intelligent portfolio assistant! 🤖

Ami ekhane apnake Zahid-er MERN Stack, AI development, projects ebong tar shathe jogajog korar shob details diye help korar jonno achi. Zahid-er bari/location holo **Dhaka, Bangladesh**। Apnar ki dorkar bolun? 😊`;
    }
    if (lang === "bn") {
      return `আমি **Tonmoy AI** — জাহিদ হাসান তন্ময়ের পার্সোনাল ইন্টেলিজেন্ট পোর্টফোলিও অ্যাসিস্ট্যান্ট! 🤖

আমি এখানে আপনাকে জাহিদের MERN স্ট্যাক, এআই ডেভেলপমেন্ট, প্রজেক্ট এবং তাঁর সাথে যোগাযোগের সব তথ্য দিয়ে সাহায্য করার জন্য আছি। জাহিদের লোকেশন **ঢাকা, বাংলাদেশ**। আপনার কী প্রয়োজন বলুন? 😊`;
    }
    return `I am **Tonmoy AI**, the personal AI representative for Zahid Hasan Tonmoy! 🤖

I'm here to help you learn about his MERN full-stack projects, AI agents, data analysis work, and how to get in touch or hire him. Zahid is based in **Dhaka, Bangladesh** and works with teams worldwide. How can I assist you today? 😊`;
  }

  // 4. Email, Phone, Contact, WhatsApp, Hire
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
    if (lang === "banglish") {
      return `Zahid Hasan Tonmoy-er shathe direct jogajog korar shob details niche dewa holo:

• 📧 **Email**: [zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)
• 📱 **Phone / WhatsApp**: [+880 1850 077786](tel:+8801850077786) ([WhatsApp Chat](https://wa.me/8801850077786))
• 💼 **LinkedIn**: [linkedin.com/in/zahidhasantonmoy](https://www.linkedin.com/in/zahidhasantonmoy/)
• 🐙 **GitHub**: [github.com/zahidhasantonmoy](https://github.com/zahidhasantonmoy)
• 📬 **Direct Message**: [Contact Form](#contact)

Zahid remote full-time role ebong high-impact project-er jonno available!`;
    }
    if (lang === "bn") {
      return `জাহিদ হাসান তন্ময়-এর সাথে সরাসরি যোগাযোগ করার সকল মাধ্যম নিচে দেওয়া হলো:

• 📧 **ইমেইল**: [zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)
• 📱 **ফোন / হোয়াটসঅ্যাপ**: [+880 1850 077786](tel:+8801850077786) ([WhatsApp Chat](https://wa.me/8801850077786))
• 💼 **লিঙ্কডইন**: [linkedin.com/in/zahidhasantonmoy](https://www.linkedin.com/in/zahidhasantonmoy/)
• 🐙 **গিটহাব**: [github.com/zahidhasantonmoy](https://github.com/zahidhasantonmoy)
• 📬 **মেসেজ পাঠান**: [কন্টাক্ট ফর্ম](#contact)

জাহিদ ফুল-টাইম রিমোট রোল ও ফ্রিল্যান্স প্রজেক্টের জন্য উন্মুক্ত!`;
    }
    return `Here are the direct ways to reach Zahid Hasan Tonmoy:

• 📧 **Email**: [zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)
• 📱 **Phone / WhatsApp**: [+880 1850 077786](tel:+8801850077786) ([WhatsApp Chat](https://wa.me/8801850077786))
• 💼 **LinkedIn**: [linkedin.com/in/zahidhasantonmoy](https://www.linkedin.com/in/zahidhasantonmoy/)
• 🐙 **GitHub**: [github.com/zahidhasantonmoy](https://github.com/zahidhasantonmoy)
• 📬 **Direct Message**: [Contact Form](#contact)

Zahid is open for full-time engineering roles, contracts, and collaborations!`;
  }

  // 5. Education, University, BUBT
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
    q.includes("ssc")
  ) {
    if (lang === "banglish") {
      return `Zahid Hasan Tonmoy-er educational background:

• 🎓 **B.Sc. in CSE (Ongoing)**: Bangladesh University of Business and Technology (BUBT), Dhaka
• 📜 **HSC (2019)**: Dhaka Udyan Government College — **GPA: 5.00 (Golden A+)**
• 🏫 **SSC (2017)**: Moharkaya High School — **GPA: 4.78**

Focus: Artificial Intelligence, Machine Learning & Full Stack Software Development!`;
    }
    if (lang === "bn") {
      return `জাহিদ হাসান তন্ময়-এর শিক্ষাগত যোগ্যতা ও অ্যাকাডেমিক ব্যাকগ্রাউন্ড:

• 🎓 **B.Sc. in Computer Science & Engineering (CSE)** (চলমান)
  **বাংলাদেশ ইউনিভার্সিটি অব বিজনেস অ্যান্ড টেকনোলজি (BUBT)**, ঢাকা
  ফোকাস: কৃত্রিম বুদ্ধিমত্তা (AI), মেশিন লার্নিং ও ফুল-স্ট্যাক ওয়েব আর্কিটেকচার।

• 📜 **উচ্চ মাধ্যমিক (HSC) - ২০১৯**: ঢাকা উদ্যান সরকারি কলেজ — **GPA: ৫.০০ (গোল্ডেন A+)**
• 🏫 **মাধ্যমিক (SSC) - ২০১৭**: মোহারকয়া উচ্চ বিদ্যালয় — **GPA: ৪.৭৮**`;
    }
    return `Zahid Hasan Tonmoy's educational background:

• 🎓 **B.Sc. in Computer Science & Engineering (CSE)** (Ongoing)
  **Bangladesh University of Business and Technology (BUBT)**, Dhaka
  Focus: AI, Machine Learning, and Full Stack Web Architecture.

• 📜 **Higher Secondary Certificate (HSC)** (2019)
  **Dhaka Udyan Government College** — **GPA: 5.00 (Golden A+)**

• 🏫 **Secondary School Certificate (SSC)** (2017)
  **Moharkaya High School** — **GPA: 4.78**`;
  }

  // 6. Projects
  if (
    q.includes("project") ||
    q.includes("প্রজেক্ট") ||
    q.includes("কাজ") ||
    q.includes("flexpath") ||
    q.includes("gold") ||
    q.includes("curious")
  ) {
    if (lang === "banglish") {
      return `Zahid Hasan Tonmoy 9+ feature-rich projects build korechen:

• 📱 **[Flexpath](https://github.com/zahidhasantonmoy/Flexpath)**: Flutter & Supabase diye gig economy app (NID verification & real-time chat).
• 📈 **[Gold Price Predictor](https://gold-price-predictor-2f1h.onrender.com/)**: Python & Scikit-learn diye machine learning regression model (R² ≈ 0.9999).
• 🛒 **[Curious Cart BD](https://curiouscart.vercel.app/)**: Next.js & React e-commerce platform.
• 🛡️ **[Vortex Shield](https://protocolzero.vercel.app/)**: AES-GCM file encryption suite.
• 📡 **[Smart Drainage System](https://github.com/zahidhasantonmoy/smartdrainagesystem)**: ESP32 IoT flood monitoring.

Shob projects dekhte visit korun: **[Projects Section](#projects)**!`;
    }
    if (lang === "bn") {
      return `Zahid Hasan Tonmoy ৯টিরও বেশি সফল প্রজেক্ট তৈরি করেছেন:

• 📱 **[Flexpath](https://github.com/zahidhasantonmoy/Flexpath)**: Flutter & Supabase দিয়ে তৈরি গিগ-ইকোনমি মোবাইল অ্যাপ (NID ভেরিফিকেশন ও রিয়েল-টাইম চ্যাট)।
• 📈 **[Gold Price Predictor](https://gold-price-predictor-2f1h.onrender.com/)**: Scikit-learn ও Python দিয়ে গোল্ড প্রাইস প্রিডিকশন অ্যাপ (R² ≈ 0.9999 একিউরেসি)।
• 🛒 **[Curious Cart BD](https://curiouscart.vercel.app/)**: Next.js, React ও TypeScript দিয়ে তৈরি ফুল-স্ট্যাক ই-কমার্স প্ল্যাটফর্ম।
• 🛡️ **[Vortex Shield](https://protocolzero.vercel.app/)**: AES-GCM ও Argon2id দিয়ে ফাইল এনক্রিপশন টুল।
• 📡 **[Smart Drainage System](https://github.com/zahidhasantonmoy/smartdrainagesystem)**: ESP32 ও MicroPython দিয়ে IoT ড্রেনেজ মনিটর।

সব প্রজেক্টের বিস্তারিত দেখতে ভিজিট করুন **[Projects Section](#projects)**!`;
    }
    return `Zahid Hasan Tonmoy has built 9+ production-ready projects:

• 📱 **[Flexpath](https://github.com/zahidhasantonmoy/Flexpath)**: Flutter & Supabase gig economy app with NID verification & in-app chat.
• 📈 **[Gold Price Predictor](https://gold-price-predictor-2f1h.onrender.com/)**: High-precision ML regression model (R² ≈ 0.9999).
• 🛒 **[Curious Cart BD](https://curiouscart.vercel.app/)**: Full-stack Next.js e-commerce app.
• 🛡️ **[Vortex Shield](https://protocolzero.vercel.app/)**: 256-bit AES-GCM military-grade file encryption tool.
• 📡 **[Smart Drainage System](https://github.com/zahidhasantonmoy/smartdrainagesystem)**: IoT flood monitoring with ESP32.

Explore all projects in the **[Projects Section](#projects)**!`;
  }

  // 7. Skills
  if (q.includes("skill") || q.includes("দক্ষতা") || q.includes("টেকনোলজি") || q.includes("stack") || q.includes("mern")) {
    if (lang === "banglish") {
      return `Zahid Hasan Tonmoy-er core technical skills & stack:

• **Full Stack**: React 18, Next.js 14, Node.js, Express.js, TypeScript, Tailwind CSS
• **Databases**: PostgreSQL (Neon), MongoDB, Supabase, Firebase, MySQL
• **Mobile & IoT**: Flutter, Dart, ESP32-S3, MicroPython
• **AI & Data Science**: Google Gemini API, Groq, Python, Scikit-learn, TensorFlow, Pandas
• **SEO & Optimization**: Technical SEO, Generative Engine Optimization (GEO), Schema.org

Shob skills dekhte visit korun: **[Skills Section](#skills)**!`;
    }
    if (lang === "bn") {
      return `Zahid Hasan Tonmoy-এর টেকনিক্যাল স্কিল ও স্ট্যাক:

• **Frontend & MERN**: React 18, Next.js 14, Node.js, Express.js, TypeScript, Tailwind CSS, Redux Toolkit
• **Databases**: PostgreSQL, MongoDB, Supabase, Firebase, MySQL
• **Mobile & IoT**: Flutter, Dart, ESP32-S3, MicroPython
• **AI & Data Science**: Gemini API, Python, Scikit-learn, TensorFlow, Pandas, NumPy
• **SEO & Marketing**: Technical SEO, Generative Engine Optimization (GEO), Google Analytics

বিস্তারিত দেখতে ভিজিট করুন **[Skills Section](#skills)**!`;
    }
    return `Zahid Hasan Tonmoy's key technical skills & stack:

• **Frontend & MERN**: React 18, Next.js 14, Node.js, Express.js, TypeScript, Tailwind CSS
• **Databases**: PostgreSQL (Neon), MongoDB, Supabase, Firebase, MySQL
• **Mobile & IoT**: Flutter, Dart, ESP32-S3, MicroPython
• **AI & Data Science**: Gemini API, Groq, Python, Scikit-learn, TensorFlow, Pandas
• **SEO & Optimization**: Technical SEO, Generative Engine Optimization (GEO), Schema.org

Explore more details in the **[Skills Section](#skills)**!`;
  }

  // 8. Resume
  if (q.includes("resume") || q.includes("cv") || q.includes("রেজুমে") || q.includes("সিভি")) {
    if (lang === "banglish") {
      return `Zahid Hasan Tonmoy-er full official Resume/CV dorkar hole shorasori request korte paren:
📬 **[Contact Form diye request korun](#contact)** ba email korun: **[zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)**

Recruiter ba client-der jonno updated CV shathe shathe email-e pathiye dewa hobe!`;
    }
    if (lang === "bn") {
      return `জাহিদ হাসান তন্ময়-এর পূর্ণাঙ্গ অফিশিয়াল রেজুমে বা CV প্রয়োজন হলে সরাসরি অনুরোধ করতে পারেন:
📬 **[কন্টাক্ট ফর্ম দিয়ে রিকোয়েস্ট করুন](#contact)** অথবা ইমেইল করুন: **[zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)**

রিক্রুটার বা ক্লায়েন্টদের জন্য কাস্টমাইজড আপডেট করা CV তাৎক্ষণিকভাবে ইমেইলে পাঠিয়ে দেওয়া হবে।`;
    }
    return `Zahid Hasan Tonmoy's official CV/Resume is available upon request:
📬 **[Request via Contact Form](#contact)** or direct email: **[zahidhasantonmoy.dev@gmail.com](mailto:zahidhasantonmoy.dev@gmail.com)**

A tailored, up-to-date resume will be delivered directly to your inbox!`;
  }

  // Default Conversational Fallback matching language
  if (lang === "banglish") {
    return `Hello! Ami **Tonmoy AI** — Zahid Hasan Tonmoy-er personal assistant. 😊

Ami apnake Zahid-er MERN Stack, Next.js, AI projects, skills ebong tar shathe jogajog korar shob bishoye shahajjo korte pari. Apnar ki jante iccha hocche bolun?`;
  }
  if (lang === "bn") {
    return `হ্যালো! আমি **Tonmoy AI** — জাহিদ হাসান তন্ময়ের পার্সোনাল অ্যাসিস্ট্যান্ট। 😊

আমি আপনাকে জাহিদের MERN স্ট্যাক, Next.js, এআই প্রজেক্ট, স্কিল কিংবা যোগাযোগের তথ্য দিয়ে সাহায্য করতে পারি। আপনি ঠিক কী বিষয়ে জানতে চাচ্ছেন বলুন?`;
  }
  return `Hello! I am **Tonmoy AI**, Zahid Hasan Tonmoy's personal AI portfolio assistant. 😊

I can help you explore his full-stack MERN & AI projects, technical skills, background, or help you get in touch with him. What would you like to know?`;
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
      const geminiModels = ["gemini-2.0-flash-lite", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"];

      for (const model of geminiModels) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const genPromise = ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
              maxOutputTokens: 750,
              temperature: 0.7,
            },
          });

          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 9000));
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
            const timer = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                  contents: [{ parts: [{ text: fullPrompt }] }],
                  generationConfig: { maxOutputTokens: 750, temperature: 0.7 },
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
          timeout: 7000,
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
          temperature: 0.7,
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
          timeout: 7000,
          maxRetries: 0,
        });

        const completion = await openrouter.chat.completions.create({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversation.map((m: any) => ({
              role: m.role as "user" | "assistant",
              content: String(m.content),
            })),
          ],
          max_tokens: 700,
          temperature: 0.7,
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
