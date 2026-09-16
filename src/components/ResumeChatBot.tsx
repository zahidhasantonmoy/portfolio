'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaRedo,
  FaChevronDown,
} from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Hi there! 👋 I'm **Tonmoy AI**, Zahid's personal AI assistant. Ask me anything about his 9+ projects, skills, tech stack, blog articles, dev journals, or how to hire him! (বাংলা ও ইংরেজিতে কথা বলতে পারি)",
};

const SUGGESTIONS = [
  '🚀 Top Projects (Flexpath & AI Apps)',
  '💼 Full Tech Stack & Skills',
  '✍️ Latest Blog Posts & Dev Journals',
  '📄 Download Resume (CV)',
  '📬 How to hire or contact Zahid?',
  '🇧🇩 বাংলায় তথ্য জানতে চাই',
];

export default function ResumeChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasOpened(true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  const handleSend = async (contentToSend?: string) => {
    const text = (contentToSend || input).trim();
    if (!text || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    if (!contentToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply },
        ]);
      } else {
        throw new Error('No reply received');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I couldn't reach the server right now. Feel free to contact Zahid directly via the [Contact Form](#contact) or on [LinkedIn](https://www.linkedin.com/in/zahid-hasan-tonmoy)!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  // Helper to render markdown bold and markdown links
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <aside
      aria-label="AI Assistant"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden"
    >
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-[90vw] sm:w-[390px] h-[520px] max-h-[82vh] bg-gray-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 text-white"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-gray-900 px-4 py-3.5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md ring-2 ring-indigo-400/40">
                    <FaRobot className="text-lg" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-gray-900"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold tracking-tight">Tonmoy AI</h3>
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-400/30 font-medium">Assistant</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Ask about skills, projects & resume</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={resetChat}
                  title="Reset conversation"
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                  aria-label="Reset conversation"
                >
                  <FaRedo className="text-xs" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                  aria-label="Minimize chat window"
                >
                  <FaChevronDown className="text-xs" />
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-gray-700">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-gray-800/90 text-gray-200 border border-gray-700/60 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{renderMessageContent(m.content)}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/90 text-gray-400 border border-gray-700/60 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Interactive Quick Prompts & Action Chips */}
            <div className="border-t border-white/10 bg-gray-950/80 flex flex-col">
              <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <span className="text-amber-400">⚡</span>
                  <span>Quick Actions & Prompts</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="text-[10px] text-gray-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition"
                >
                  {showPrompts ? 'Hide' : 'Show'}
                </button>
              </div>

              {showPrompts && (
                <div className="px-3 pb-2 pt-1 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none text-[11px]">
                  {SUGGESTIONS.map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(chip)}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 hover:bg-indigo-900 text-indigo-200 hover:text-white transition flex-shrink-0 shadow-sm active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                  {/* Direct Action: Resume PDF */}
                  <a
                    href="/files/Resume/Zahid_Hasan_Resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 hover:text-white transition flex-shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <span>📄 Open Resume PDF ↗</span>
                  </a>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-2.5 bg-gray-950/90 border-t border-white/10 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Zahid's experience..."
                disabled={isLoading}
                className="flex-1 bg-gray-800/80 text-white placeholder-gray-400 text-xs px-3.5 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition flex items-center justify-center shadow-md shadow-indigo-600/30"
                aria-label="Send message"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button with Pulse indicator */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative group p-3.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white rounded-full shadow-xl shadow-indigo-600/30 flex items-center gap-2 border border-indigo-400/30"
        aria-label={isOpen ? 'Close AI Chat' : 'Chat with Zahid AI'}
      >
        {/* Pulse effect if never opened */}
        {!hasOpened && !isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
        )}

        {isOpen ? (
          <FaTimes className="text-lg" />
        ) : (
          <>
            <BsChatDotsFill className="text-lg" />
            <span className="hidden sm:inline text-xs font-semibold pr-1">Ask AI</span>
          </>
        )}
      </motion.button>
    </aside>
  );
}
