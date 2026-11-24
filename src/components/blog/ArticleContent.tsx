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

  // Calculate deterministic estimated height based on diagram complexity to eliminate CLS (Cumulative Layout Shift)
  const estimatedHeight = useMemo(() => {
    const rawLines = chart.split("\n").filter((l) => l.trim().length > 0 && !l.trim().startsWith("%%"));
    // Diagrams typically need ~36px per node/connection line, bounded between 240px and 460px
    return Math.min(Math.max(rawLines.length * 36, 240), 460);
  }, [chart]);

  useEffect(() => {
    let isMounted = true;
    async function renderChart() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#0a1120",
            primaryColor: "#122036",
            primaryTextColor: "#eef4ff",
            primaryBorderColor: "#0e7d99",
            lineColor: "#2fd8f2",
            secondaryColor: "#0e1729",
            secondaryTextColor: "#eef4ff",
            secondaryBorderColor: "#22345a",
            tertiaryColor: "#0a1120",
            tertiaryTextColor: "#eef4ff",
            tertiaryBorderColor: "#22345a",
            textColor: "#c3d2ea",
            titleColor: "#eef4ff",
            nodeTextColor: "#eef4ff",
            nodeBorder: "#0e7d99",
            edgeLabelBackground: "#0a1120",
            clusterBkg: "#0a1120",
            clusterBorder: "#22345a",
            mainBkg: "#122036",
            fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif",
            fontSize: "14px",
          },
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            useMaxWidth: true,
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

  return (
    <figure
      className="not-prose my-8 rounded-[20px] border-[1.5px] border-[#1a2947] bg-[#0a1120] p-4 md:p-6 overflow-hidden text-[#eef4ff]"
      aria-label="System Architecture Diagram"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1a2947] text-xs text-[#a9bedd] font-mono select-none">
        <span className="flex items-center gap-1.5 text-[#2fd8f2] font-medium">
          <span>📊</span> Architecture Diagram
        </span>
        <span className="text-[10px] bg-[#122036] text-[#2fd8f2] px-2 py-0.5 rounded border border-[#22345a] font-semibold uppercase">
          {svg ? "Mermaid SVG" : "Architecture Flow"}
        </span>
      </div>

      <div
        className="w-full flex items-center justify-center transition-all duration-300"
        style={{ minHeight: `${estimatedHeight}px` }}
      >
        {svg ? (
          <div
            className="mermaid-diagram-wrapper w-full overflow-x-auto flex justify-center py-2 [&_svg]:max-w-full [&_svg]:h-auto [&_svg_text]:!fill-[#eef4ff] [&_span]:!text-[#eef4ff] [&_.edgeLabel]:!text-[#c3d2ea] [&_.edgeLabel_span]:!text-[#c3d2ea] [&_.nodeLabel]:!text-white [&_.cluster-label]:!text-[#c3d2ea] transition-opacity duration-300"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : error ? (
          <div className="w-full rounded-xl border border-[#ffb02e]/30 bg-[#ffb02e]/10 p-4 text-xs font-mono text-[#c3d2ea]">
            <p className="text-[#ffb02e] mb-2 font-semibold">Diagram representation:</p>
            <pre className="overflow-x-auto"><code>{chart}</code></pre>
          </div>
        ) : (
          /* SSR & Pre-hydration fallback: crawlers and non-JS engines read this complete graph directly from raw HTML */
          <div className="w-full py-2 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3 text-xs text-[#2fd8f2]/80">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2fd8f2] animate-pulse" />
              <span>Interactive diagram rendering...</span>
            </div>
            <pre className="overflow-x-auto text-xs font-mono text-[#2fd8f2]/90 bg-black/40 p-4 rounded-xl border border-[#22345a]">
              <code>{chart}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Accessible semantic caption and noscript fallback for non-JS AI crawlers (ChatGPT, Perplexity, Claude, Googlebot) */}
      <figcaption className="sr-only">
        System architecture specification and node flow: {chart}
      </figcaption>
      <noscript>
        <pre className="overflow-x-auto text-xs font-mono text-[#c3d2ea] bg-[#0a1120] p-4 rounded-xl mt-3">
          <code>{chart}</code>
        </pre>
      </noscript>
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
    <div className="relative group my-6 rounded-2xl overflow-hidden border-[1.5px] border-[#22345a] bg-[#0a1120]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1729] border-b border-[#1a2947] text-xs text-[#a9bedd] font-mono select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          {language && (
            <span className="ml-2 px-2 py-0.5 rounded bg-[#122036] text-[11px] font-semibold uppercase tracking-wider text-[#2fd8f2]">
              {language}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#122036] hover:bg-[#1a2947] text-[#c3d2ea] hover:text-[#eef4ff] transition-all text-xs font-medium border border-[#22345a] active:scale-95"
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
      <pre {...props} className="!mt-0 !mb-0 !rounded-none !border-none !bg-transparent p-4 overflow-x-auto text-sm leading-relaxed text-[#eef4ff]">
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
      <p className="text-[#a9bedd] italic">Content not available.</p>
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
    <div className={`prose max-w-none ${proseSize}
      transition-all duration-200
      prose-headings:text-[#eef4ff] prose-headings:tracking-tight
      prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:font-bold
      prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:font-['Unbounded',sans-serif] prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
      prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-3
      prose-h4:text-lg prose-h4:font-bold
      prose-p:text-[#c3d2ea] prose-p:leading-relaxed prose-p:text-[17px]
      prose-a:text-[#2fd8f2] prose-a:font-medium hover:prose-a:underline hover:prose-a:text-[#ffb02e]
      prose-strong:text-[#eef4ff] prose-strong:font-bold
      prose-code:text-[#2fd8f2]
      prose-code:bg-[#122036]
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[0.9em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
      prose-blockquote:border-l-4 prose-blockquote:border-l-[#ffb02e] prose-blockquote:bg-[#122036]/60 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-[#c3d2ea] prose-blockquote:not-italic
      prose-img:rounded-[22px] prose-img:border prose-img:border-[#1a2947]
      prose-table:text-sm prose-th:text-[#eef4ff] prose-th:font-bold prose-td:text-[#c3d2ea] prose-td:border-[#1a2947] prose-th:border-[#1a2947]
      prose-hr:border-[#22345a]
      prose-li:text-[#c3d2ea] prose-li:marker:text-[#2fd8f2]
      prose-ul:text-[#c3d2ea] prose-ol:text-[#c3d2ea]`}>
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
          table: ({ children, ...props }: any) => (
            <div className="w-full my-6 overflow-x-auto rounded-xl border border-[#1a2947]">
              <table className="min-w-full divide-y divide-[#1a2947] text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
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
                  className="rounded-[22px] border border-[#1a2947] w-full max-h-[550px] object-contain mx-auto bg-[#0a1120]"
                  {...props}
                />
                {alt && (
                  <figcaption className="text-center text-xs text-[#a9bedd] mt-2.5 italic">
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
