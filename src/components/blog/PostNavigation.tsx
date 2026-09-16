import Link from "next/link";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface PostNavProps {
  prev: { title_en: string; title_bn?: string | null; slug: string } | null;
  next: { title_en: string; title_bn?: string | null; slug: string } | null;
  lang?: "en" | "bn";
}

export default function PostNavigation({ prev, next, lang = "en" }: PostNavProps) {
  if (!prev && !next) return null;

  const prevTitle = lang === "bn" && prev?.title_bn ? prev.title_bn : prev?.title_en;
  const nextTitle = lang === "bn" && next?.title_bn ? next.title_bn : next?.title_en;

  const prevHref = lang === "bn" ? `/bn/blog/${prev?.slug}` : `/blog/${prev?.slug}`;
  const nextHref = lang === "bn" ? `/bn/blog/${next?.slug}` : `/blog/${next?.slug}`;

  return (
    <nav
      aria-label="Post navigation"
      className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {prev ? (
        <Link
          href={prevHref}
          className="group p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition-transform" />
            <span>{lang === "bn" ? "পূর্ববর্তী পোস্ট" : "Previous Article"}</span>
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {prevTitle}
          </p>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={nextHref}
          className="group p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm flex flex-col justify-between text-left sm:text-right"
        >
          <div className="flex items-center sm:justify-end gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
            <span>{lang === "bn" ? "পরবর্তী পোস্ট" : "Next Article"}</span>
            <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {nextTitle}
          </p>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
