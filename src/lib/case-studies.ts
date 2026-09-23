import fs from "fs/promises";
import path from "path";
import type { CaseStudy, CaseStudyCategory } from "@/types/case-study";

const CASE_STUDIES_DIR = path.join(process.cwd(), "src", "data", "case-studies");

let cachedCaseStudies: CaseStudy[] | null = null;

async function loadCaseStudiesFromDisk(): Promise<CaseStudy[]> {
  try {
    await fs.mkdir(CASE_STUDIES_DIR, { recursive: true });
    const entries = await fs.readdir(CASE_STUDIES_DIR);
    const jsonFiles = entries.filter(
      (file) => file.endsWith(".json") && !file.startsWith("_") && !file.startsWith(".")
    );

    const caseStudies: CaseStudy[] = [];

    for (const file of jsonFiles) {
      const filePath = path.join(CASE_STUDIES_DIR, file);
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw) as CaseStudy;
        caseStudies.push(parsed);
      } catch (err) {
        console.error(`[case-studies] Failed to parse ${file}:`, err);
      }
    }

    // Sort by published_date descending
    caseStudies.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());
    return caseStudies;
  } catch (err) {
    console.error("[case-studies] Failed to read case studies directory:", err);
    return [];
  }
}

export async function getAllCaseStudies(opts?: {
  category?: CaseStudyCategory | "all";
  status?: "published" | "all";
}): Promise<CaseStudy[]> {
  // In development, reload to reflect edits immediately
  if (process.env.NODE_ENV === "development" || !cachedCaseStudies) {
    cachedCaseStudies = await loadCaseStudiesFromDisk();
  }

  let list = cachedCaseStudies;

  if (opts?.status !== "all") {
    list = list.filter((cs) => cs.status === "published");
  }

  if (opts?.category && opts.category !== "all") {
    list = list.filter((cs) => cs.category === opts.category);
  }

  return list;
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  const all = await getAllCaseStudies({ status: "all" });
  return all.find((cs) => cs.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export async function getAdjacentCaseStudies(
  currentSlug: string
): Promise<{ prev: CaseStudy | null; next: CaseStudy | null }> {
  const all = await getAllCaseStudies({ status: "published" });
  const index = all.findIndex((cs) => cs.slug === currentSlug);

  if (index === -1) return { prev: null, next: null };

  const prev = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  return { prev, next };
}
