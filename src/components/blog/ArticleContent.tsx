"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import "highlight.js/styles/github-dark.css";

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  if (!content) {
    return (
      <p className="text-gray-500 italic">Content not available.</p>
    );
  }

  return (
    <div className="prose prose-gray dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
      prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
      prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
      prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-gray-900 dark:prose-strong:text-white
      prose-code:text-indigo-700 dark:prose-code:text-indigo-300
      prose-code:bg-indigo-50 dark:prose-code:bg-indigo-950/50
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800
      prose-pre:rounded-xl prose-pre:shadow-xl
      prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
      prose-img:rounded-xl prose-img:shadow-md
      prose-table:text-sm prose-th:text-gray-900 dark:prose-th:text-white
      prose-li:text-gray-700 dark:prose-li:text-gray-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          h2: ({ children, ...props }) => {
            const text = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
            return <h2 id={text} className="scroll-mt-24" {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const text = String(children).toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
            return <h3 id={text} className="scroll-mt-24" {...props}>{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
