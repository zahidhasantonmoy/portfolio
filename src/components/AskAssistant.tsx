'use client';

import { useEffect, useRef, useState } from 'react';

type Role = 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
}

const WHATSAPP_URL = 'https://wa.me/8801850077786';

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Hi! I'm Zahid's page assistant. Ask me what he builds, his best projects, his skills — or how to hire him. 👇",
};

const QUICK_CHIPS: { label: string; question: string }[] = [
  { label: 'What can you build for me?', question: 'What can you build for me?' },
  { label: 'Best projects', question: 'Show me your best projects' },
  { label: 'Skills', question: 'What are your skills?' },
  { label: 'How to hire', question: 'How do I hire you?' },
];

const ERROR_MESSAGE =
  "Sorry — I couldn't reach the assistant server just now. Please try again in a moment, or message Zahid directly on WhatsApp: ";

/** Render the API's markdown-lite replies: **bold** and [text](url). */
function renderMessageContent(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, linkText, href] = linkMatch;
      if (href.startsWith('#')) {
        return (
          <a
            key={index}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-bold text-[#2fd8f2] underline hover:text-[#ffb02e]"
          >
            {linkText}
          </a>
        );
      }
      return (
        <a
          key={index}
          href={href}
          target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
          className="font-bold text-[#2fd8f2] underline hover:text-[#ffb02e]"
        >
          {linkText}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function AskAssistant() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isLoading]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || isLoading) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setHasError(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      let data: { reply?: string; error?: string } | null = null;
      try {
        data = (await res.json()) as { reply?: string; error?: string };
      } catch {
        data = null;
      }

      if (!res.ok || !data || typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error(data?.error || `Chat API failed (${res.status})`);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply as string }]);
    } catch (err) {
      console.error('[AskAssistant] /api/chat failed:', err);
      setHasError(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${ERROR_MESSAGE}__WHATSAPP__`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <section
      id="ask"
      aria-label="Ask about my work"
      className="relative mt-[18px] overflow-hidden rounded-[22px] border-[1.5px] border-[#0e7d99] bg-[#0e1729] p-[18px]"
    >
      {/* Top gradient bar (design: cyan → amber) */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2fd8f2] to-[#ffb02e]"
      />

      {/* Head */}
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[#2fd8f2] text-[17px] font-black text-[#04121a]"
        >
          AI
        </div>
        <div>
          <h2 className="text-[18.5px] font-extrabold leading-[1.2] text-[#eef4ff]">
            Ask about my work
          </h2>
          <p className="text-[13.5px] text-[#a9bedd]">
            A small assistant that lives on this page — try it, it knows my projects.
          </p>
        </div>
      </div>

      {/* Log */}
      <div
        ref={logRef}
        aria-live="polite"
        className="mt-[14px] grid max-h-[300px] gap-[10px] overflow-y-auto pr-[2px]"
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[88%] rounded-2xl px-[14px] py-[10px] text-[15px] leading-[1.5] ${
              m.role === 'user'
                ? 'justify-self-end rounded-br-[5px] bg-[#2fd8f2] font-semibold text-[#04121a]'
                : 'justify-self-start rounded-bl-[5px] border border-[#1a2947] bg-[#122036] text-[#eef4ff]'
            }`}
          >
            <div className="whitespace-pre-wrap">
              {m.content === `${ERROR_MESSAGE}__WHATSAPP__` ? (
                <>
                  {ERROR_MESSAGE}
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#2fd8f2] underline hover:text-[#ffb02e]"
                  >
                    WhatsApp +880 1850 077786
                  </a>
                </>
              ) : (
                renderMessageContent(m.content)
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="justify-self-start rounded-2xl rounded-bl-[5px] border border-[#1a2947] bg-[#122036] px-[14px] py-[10px]">
            <span className="inline-flex items-center gap-1" aria-label="Thinking">
              <span className="h-[7px] w-[7px] animate-bounce rounded-full bg-[#a9bedd] [animation-delay:0s]" />
              <span className="h-[7px] w-[7px] animate-bounce rounded-full bg-[#a9bedd] [animation-delay:0.15s]" />
              <span className="h-[7px] w-[7px] animate-bounce rounded-full bg-[#a9bedd] [animation-delay:0.3s]" />
            </span>
          </div>
        )}
      </div>

      {/* Quick chips */}
      <div className="mt-[14px] flex flex-wrap gap-2">
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => void ask(chip.question)}
            disabled={isLoading}
            className="min-h-[44px] rounded-full border-[1.5px] border-[#22345a] bg-[#122036] px-[15px] py-[9px] text-[14px] font-bold text-[#eef4ff] transition hover:border-[#2fd8f2] hover:text-[#2fd8f2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question… e.g. “Do you make mobile apps?”"
          aria-label="Ask a question about Zahid's work"
          autoComplete="off"
          disabled={isLoading}
          className="min-h-[48px] min-w-0 flex-1 rounded-[13px] border-[1.5px] border-[#22345a] bg-[#0a1120] px-[15px] py-[11px] text-[16px] text-[#eef4ff] placeholder:text-[#a9bedd]/70 focus:border-[#2fd8f2] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[48px] rounded-[13px] bg-[#ffb02e] px-5 py-[11px] text-[15.5px] font-extrabold text-[#1a1200] transition hover:bg-[#2fd8f2] hover:text-[#04121a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </form>

      {hasError && (
        <p className="mt-2 text-[12.5px] leading-snug text-[#a9bedd]">
          The assistant is unreachable right now — your question was not lost, just try again,
          or reach Zahid on{' '}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#2fd8f2] underline hover:text-[#ffb02e]"
          >
            WhatsApp
          </a>
          .
        </p>
      )}
    </section>
  );
}
