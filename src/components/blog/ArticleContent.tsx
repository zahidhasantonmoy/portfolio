"use client";

import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import "highlight.js/styles/github-dark.css";
import { toast } from "react-hot-toast";

interface ArticleContentProps {
  content: string;
}

function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && node.props && node.props.children) {
    return extractText(node.props.children);
  }
  return "";
}

function MermaidDiagram({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const chartId = useMemo(() => `mermaid-${Math.random().toString(36).substring(2, 9)}`, []);

  useEffect(() => {
    let isMounted = true;
    async function renderChart() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#6366f1",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#818cf8",
            lineColor: "#38bdf8",
            secondaryColor: "#a855f7",
            tertiaryColor: "#1e1b4b",
            background: "#0f172a",
          },
          securityLevel: "loose",
        });

        const { svg: renderedSvg } = await mermaid.render(chartId, chart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(false);
        }
      } catch (err) {
        console.warn("[Mermaid] Render failed:", err);
        if (isMounted) setError(true);
      }
    }

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart, chartId]);

  if (error || !svg) {
    if (error) {
      return (
        <div className="my-6 rounded-xl border border-gray-800 bg-[#0d1117] p-4 text-xs font-mono text-gray-300">
          <p className="text-amber-400 mb-2 font-semibold">Diagram representation:</p>
          <pre className="overflow-x-auto">{chart}</pre>
        </div>
      );
    }
    return (
      <div className="my-6 flex items-center justify-center p-8 rounded-xl border border-indigo-900/40 bg-indigo-950/20 text-xs text-indigo-300 animate-pulse">
        <span>⚡ Rendering architecture diagram...</span>
      </div>
    );
  }

  return (
    <figure className="my-8 rounded-2xl border border-indigo-900/40 bg-[#0d1117]/90 p-4 md:p-6 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800 text-xs text-gray-400 font-mono select-none">
        <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
          <span>📊</span> Architecture Diagram
        </span>
        <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800/60 font-semibold uppercase">
          Mermaid SVG
        </span>
      </div>
      <div
        className="w-full overflow-x-auto flex justify-center py-2 [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}

function PreBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const codeChild = Array.isArray(children) ? children[0] : children;
  const rawCode = extractText(codeChild);
  const className = codeChild?.props?.className || "";
  const match = /language-(\w+)/.exec(className);
  const language = match ? match[1] : "";

  if (language === "mermaid") {
    return <MermaidDiagram chart={rawCode.trim()} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode.trim());
      setCopied(true);
      toast.success("Code copied to clipboard!", {
        icon: "📋",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-gray-800 bg-[#0d1117] shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/90 border-b border-gray-800/80 text-xs text-gray-400 font-mono select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          {language && (
            <span className="ml-2 px-2 py-0.5 rounded bg-gray-800 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-xs font-medium border border-gray-700/60 shadow-sm active:scale-95"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre {...props} className="!mt-0 !mb-0 !rounded-none !border-none !bg-transparent p-4 overflow-x-auto text-sm leading-relaxed text-gray-200">
        {children}
      </pre>
    </div>
  );
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

import { useBlogReader } from "./BlogReaderContext";

export default function ArticleContent({ content }: ArticleContentProps) {
  const { fontSize } = useBlogReader();

  if (!content) {
    return (
      <p className="text-gray-500 italic">Content not available.</p>
    );
  }

  // Gracefully filter out any unreplaced image markers so live readers never see raw tag codes
  const displayContent = content.replace(/\{\{IMAGE:[^}]+\}\}\s*\n?/gi, "");

  const proseSize = {
    sm: "prose-sm",
    base: "prose-base",
    lg: "prose-lg",
    xl: "prose-xl",
  }[fontSize] || "prose-lg";

  return (
    <div className={`prose prose-gray dark:prose-invert max-w-none ${proseSize}
      transition-all duration-200
      prose-headings:font-extrabold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:tracking-tight
      prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-xl md:prose-h3:text-2xl
      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:font-medium hover:prose-a:underline hover:prose-a:text-indigo-500
      prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
      prose-code:text-indigo-700 dark:prose-code:text-indigo-300
      prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/60
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.9em] prose-code:font-mono
      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
      prose-blockquote:border-l-4 prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/30 dark:prose-blockquote:bg-indigo-950/20 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 prose-blockquote:not-italic
      prose-img:rounded-2xl prose-img:shadow-lg prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-800
      prose-table:text-sm prose-th:text-gray-900 dark:prose-th:text-white prose-th:font-bold
      prose-li:text-gray-700 dark:prose-li:text-gray-300`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          h2: ({ children, ...props }) => {
            const rawText = extractText(children);
            const id = slugifyHeading(rawText);
            return <h2 id={id} className="scroll-mt-28" {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const rawText = extractText(children);
            const id = slugifyHeading(rawText);
            return <h3 id={id} className="scroll-mt-28" {...props}>{children}</h3>;
          },
          pre: PreBlock,
          img: ({ src, alt, title, ...props }: any) => {
            return (
              <figure className="my-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || "Article diagram illustration"}
                  title={title || alt || "Article illustration"}
                  loading="lazy"
                  decoding="async"
                  className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 w-full max-h-[550px] object-contain mx-auto bg-black/5 dark:bg-black/20"
                  {...props}
                />
                {alt && (
                  <figcaption className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2.5 italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
