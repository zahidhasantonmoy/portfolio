"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiPlay,
  FiPause,
  FiSquare,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

interface ArticleAudioPlayerProps {
  title: string;
  content: string;
  excerpt?: string;
  readTimeMin?: number;
  lang?: "en" | "bn";
}

/**
 * Cleans markdown text so browser Text-To-Speech narrates naturally,
 * omitting raw code blocks, raw URLs, and markdown tokens.
 */
function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return "";

  let text = markdown;

  // 1. Remove multiline code blocks (replace with brief pause notice)
  text = text.replace(/```[\s\S]*?```/g, " ");

  // 2. Remove inline code backticks
  text = text.replace(/`([^`]+)`/g, "$1");

  // 3. Remove image syntax ![alt](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, " ");

  // 4. Convert markdown links [text](url) -> text
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");

  // 5. Remove HTML tags
  text = text.replace(/<[^>]*>/g, " ");

  // 6. Remove headings hashes, blockquotes, bullets, bold/italic symbols
  text = text.replace(/^#{1,6}\s+/gm, " ");
  text = text.replace(/^>\s+/gm, " ");
  text = text.replace(/^\s*[-*+]\s+/gm, " ");
  text = text.replace(/^\s*\d+\.\s+/gm, " ");
  text = text.replace(/[*_~]{1,3}/g, " ");

  // 7. Remove raw URLs
  text = text.replace(/https?:\/\/\S+/g, " ");

  // 8. Collapse excessive whitespace and newlines
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Splits sanitized text into safe spoken chunks.
 * Chrome/Edge SpeechSynthesis has a bug where single utterances longer than ~200 chars
 * prematurely stop. Chunking by sentence or punctuation ensures 100% reliable narration.
 */
function splitIntoChunks(text: string): string[] {
  if (!text) return [];

  // Match sentences ending in punctuation including Bengali danda '।'
  const sentences = text.match(/[^.!?।\n]+[.!?।\n]*/g) || [text];
  const chunks: string[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // If a sentence is extraordinarily long (>250 chars), break by commas or spaces
    if (trimmed.length > 250) {
      const parts = trimmed.split(/([,;，、]\s*)/);
      let buffer = "";
      for (const p of parts) {
        if ((buffer + p).length > 200) {
          if (buffer.trim()) chunks.push(buffer.trim());
          buffer = p;
        } else {
          buffer += p;
        }
      }
      if (buffer.trim()) chunks.push(buffer.trim());
    } else {
      chunks.push(trimmed);
    }
  }

  return chunks;
}

const SPEEDS = [1, 1.25, 1.5, 2, 0.8];

export default function ArticleAudioPlayer({
  title,
  content,
  excerpt,
  readTimeMin,
  lang = "en",
}: ArticleAudioPlayerProps) {
  const [isSupported, setIsSupported] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioMode, setAudioMode] = useState<"summary" | "full">("summary");
  const [speedIndex, setSpeedIndex] = useState(0); // default 1.0x
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunks, setChunks] = useState<string[]>([]);
  const [voiceName, setVoiceName] = useState<string>("");

  const currentRate = SPEEDS[speedIndex];
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const rateRef = useRef(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  chunksRef.current = chunks;
  chunkIndexRef.current = currentChunkIndex;
  isPlayingRef.current = isPlaying;
  rateRef.current = currentRate;

  // Initialize SpeechSynthesis on mount or when mode/content changes
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    synthRef.current = window.speechSynthesis;

    // Prepare speech chunks based on audioMode
    const cleanBody = sanitizeMarkdown(content);
    let allChunks: string[] = [];

    if (audioMode === "summary") {
      const cleanExcerpt = excerpt ? sanitizeMarkdown(excerpt) : "";
      const summaryText = cleanExcerpt.trim()
        ? cleanExcerpt.trim()
        : splitIntoChunks(cleanBody).slice(0, 3).join(" ");
      const intro =
        lang === "bn"
          ? `আর্টিকেল ওভারভিউ: ${title}। মূলভাব: `
          : `Quick audio overview of ${title}. Key takeaways: `;
      allChunks = [intro, ...splitIntoChunks(summaryText)];
    } else {
      const intro = lang === "bn" ? `আর্টিকেল: ${title}।` : `Article: ${title}.`;
      allChunks = [intro, ...splitIntoChunks(cleanBody)];
    }

    setChunks(allChunks);

    // Pick best matching voice
    const pickVoice = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      if (!voices || voices.length === 0) return;

      if (lang === "bn") {
        const bnVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("bn") ||
            v.name.toLowerCase().includes("bangla") ||
            v.name.toLowerCase().includes("bengali")
        );
        if (bnVoice) {
          setVoiceName(bnVoice.name);
        } else {
          setVoiceName("Browser Default");
        }
      } else {
        const enVoice = voices.find(
          (v) =>
            (v.lang.toLowerCase().startsWith("en-us") ||
              v.lang.toLowerCase().startsWith("en-gb")) &&
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Microsoft") ||
              v.name.includes("Samantha"))
        ) || voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        if (enVoice) {
          setVoiceName(enVoice.name);
        } else {
          setVoiceName("Default Voice");
        }
      }
    };

    pickVoice();
    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = pickVoice;
    }

    // Cancel speech on unmount
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [title, content, excerpt, lang, audioMode]);

  const handleToggleMode = (newMode: "summary" | "full") => {
    if (newMode === audioMode) return;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
    setAudioMode(newMode);
  };

  // Speak a specific chunk index
  const speakChunk = useCallback(
    (index: number) => {
      const synth = synthRef.current;
      if (!synth || index >= chunksRef.current.length) {
        // Finished narration
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentChunkIndex(0);
        return;
      }

      const text = chunksRef.current[index];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rateRef.current;

      // Select voice if available
      const voices = synth.getVoices();
      if (lang === "bn") {
        const bnVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith("bn") ||
            v.name.toLowerCase().includes("bangla") ||
            v.name.toLowerCase().includes("bengali")
        );
        if (bnVoice) utterance.voice = bnVoice;
        utterance.lang = "bn-BD";
      } else {
        const enVoice = voices.find(
          (v) =>
            (v.lang.toLowerCase().startsWith("en-us") ||
              v.lang.toLowerCase().startsWith("en-gb")) &&
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Microsoft") ||
              v.name.includes("Samantha"))
        ) || voices.find((v) => v.lang.toLowerCase().startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = "en-US";
      }

      utterance.onend = () => {
        if (!isPlayingRef.current) return;
        const nextIdx = index + 1;
        setCurrentChunkIndex(nextIdx);
        speakChunk(nextIdx);
      };

      utterance.onerror = (e) => {
        // 'interrupted' is normal when user cancels or skips
        if (e.error !== "interrupted") {
          console.warn("Speech synthesis error:", e);
        }
        if (isPlayingRef.current) {
          const nextIdx = index + 1;
          setCurrentChunkIndex(nextIdx);
          speakChunk(nextIdx);
        }
      };

      synth.speak(utterance);
    },
    [lang]
  );

  const handlePlay = () => {
    const synth = synthRef.current;
    if (!synth) return;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synth.cancel();
    setIsPlaying(true);
    setIsPaused(false);
    speakChunk(currentChunkIndex);
  };

  const handlePause = () => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    const synth = synthRef.current;
    if (!synth) return;
    synth.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentChunkIndex(0);
  };

  const handleToggleSpeed = () => {
    const nextIdx = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIdx);

    // If currently playing, restart current chunk at new speed
    if (isPlaying && synthRef.current) {
      synthRef.current.cancel();
      rateRef.current = SPEEDS[nextIdx];
      speakChunk(currentChunkIndex);
    }
  };

  if (!isSupported) {
    return null; // Gracefully hidden if browser doesn't support Web Speech API
  }

  const progressPercent =
    chunks.length > 0 ? Math.round((currentChunkIndex / chunks.length) * 100) : 0;

  const t = {
    title: lang === "bn" ? "অডিও ওভারভিউ ও পডকাস্ট" : "Audio Overview & Podcast",
    summaryMode: lang === "bn" ? "⚡ ১ মিনিট সারসংক্ষেপ" : "⚡ 1-Min Summary",
    fullMode: lang === "bn" ? "📖 সম্পূর্ণ আর্টিকেল" : "📖 Full Article",
    subtitle: lang === "bn" ? "ভয়েস রিডার (Audio)" : "Audio Narration",
    playing: lang === "bn" ? "চলছে..." : "Playing...",
    paused: lang === "bn" ? "পজ করা হয়েছে" : "Paused",
    ready:
      audioMode === "summary"
        ? lang === "bn"
          ? "~১ মিনিট কুইক ওভারভিউ"
          : "~1 min quick overview"
        : lang === "bn"
        ? `${readTimeMin ? `${readTimeMin} মিনিট শোনা` : "শুনতে প্লে করুন"}`
        : `${readTimeMin ? `~${readTimeMin} min listen` : "Ready to play"}`,
    speed: `${currentRate}x`,
    stop: lang === "bn" ? "বন্ধ" : "Stop",
  };

  return (
    <div className="my-8 relative overflow-hidden rounded-2xl border border-indigo-200/70 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-white/80 to-purple-50/70 dark:from-indigo-950/40 dark:via-gray-900/70 dark:to-purple-950/40 backdrop-blur-md shadow-sm p-4 sm:p-5 transition-all duration-300">
      {/* Ambient background glow when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-400/5 animate-pulse pointer-events-none" />
      )}

      {/* Mode Selector Header */}
      <div className="flex items-center gap-1.5 mb-3.5 pb-2.5 border-b border-indigo-100/70 dark:border-indigo-900/50">
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mr-1 hidden sm:inline">
          {lang === "bn" ? "মোড:" : "Mode:"}
        </span>
        <button
          type="button"
          onClick={() => handleToggleMode("summary")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            audioMode === "summary"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
              : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-gray-200/60 dark:border-gray-700/60"
          }`}
        >
          {t.summaryMode}
        </button>
        <button
          type="button"
          onClick={() => handleToggleMode("full")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            audioMode === "full"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
              : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-gray-200/60 dark:border-gray-700/60"
          }`}
        >
          {t.fullMode}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
        {/* Left Side: Play Button & Article Info */}
        <div className="flex items-center gap-3.5">
          {/* Main Play / Pause Button */}
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            aria-label={isPlaying ? "Pause audio narration" : "Play audio narration"}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex-shrink-0 group"
          >
            {isPlaying ? (
              <FiPause className="w-5 h-5 group-hover:scale-110 transition-transform" />
            ) : (
              <FiPlay className="w-5 h-5 ml-0.5 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* Title & Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {t.title}
              </span>
              <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                <HiSparkles className="w-3 h-3 text-indigo-500" />
                TTS
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {isPlaying ? (
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                  {/* Animated Equalizer Waveform */}
                  <span className="flex items-end gap-[2px] h-3">
                    <span className="w-0.5 h-full bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite_ease-in-out]" />
                    <span className="w-0.5 h-2/3 bg-indigo-500 rounded-full animate-[bounce_0.6s_infinite_ease-in-out]" />
                    <span className="w-0.5 h-full bg-indigo-500 rounded-full animate-[bounce_0.9s_infinite_ease-in-out]" />
                    <span className="w-0.5 h-1/2 bg-indigo-500 rounded-full animate-[bounce_0.7s_infinite_ease-in-out]" />
                  </span>
                  <span>{t.playing}</span>
                </div>
              ) : isPaused ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {t.paused}
                </span>
              ) : (
                <span>{t.ready}</span>
              )}

              {voiceName && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[120px] text-gray-400">
                    {voiceName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Speed Selector, Stop Button, & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 dark:border-gray-800/50">
          {/* Stop / Reset Button */}
          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              title={t.stop}
              className="p-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <FiSquare className="w-4 h-4" />
            </button>
          )}

          {/* Speed Multiplier Pill */}
          <button
            onClick={handleToggleSpeed}
            title="Adjust narration speed"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <FiVolume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t.speed}</span>
          </button>

          {/* Progress Indicator */}
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[36px] text-right">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {(isPlaying || isPaused || progressPercent > 0) && (
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700/60 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
