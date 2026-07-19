import fs from "fs";
import path from "path";
import { cache } from "react";
import { countWords } from "./markdown";
import type { Chapter, ChapterMeta, Gap, Novel } from "./types";

/**
 * La bibliothèque fouille le dépôt :
 *  - les dossiers déclarés dans `library.config.json` ;
 *  - tout sous-dossier de `content/` contenant des fichiers .md
 *    (déposer un dossier suffit pour qu'un nouveau novel apparaisse).
 *
 * Chaque fichier .md peut contenir UN chapitre (`# Chapitre N — Titre`)
 * ou PLUSIEURS (`## Chapitre N — Titre`). Un `novel.json` optionnel dans le
 * dossier fournit titre, description, tags, etc.
 */

const ROOT = process.cwd();

const CHAPTER_HEADING = /^#{1,3}\s+Chapitre\s+(\d+)\s*(?:[—–:-]\s*(.*?))?\s*$/i;

interface NovelConfigEntry {
  dir: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  description?: string;
  tags?: string[];
  status?: string;
  accent?: string;
  plannedChapters?: number;
}

interface LibraryConfig {
  contentRoot?: string;
  novels?: NovelConfigEntry[];
}

function readConfig(): LibraryConfig {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "library.config.json"), "utf8"));
  } catch {
    return {};
  }
}

function readNovelJson(dir: string): Partial<NovelConfigEntry> {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "novel.json"), "utf8"));
  } catch {
    return {};
  }
}

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .sort()
    .map((f) => path.join(dir, f));
}

interface ParsedFile {
  chapters: { num: number; title: string; content: string }[];
  novelTitle?: string;
  preamble?: string;
}

/** Découpe un fichier .md en chapitres. */
export function parseFile(filePath: string, raw: string): ParsedFile {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const headings: { idx: number; num: number; title: string }[] = [];
  let novelTitle: string | undefined;

  lines.forEach((line, idx) => {
    const m = line.match(CHAPTER_HEADING);
    if (m) {
      headings.push({ idx, num: parseInt(m[1], 10), title: (m[2] ?? "").trim() });
    } else if (!novelTitle) {
      const h1 = line.match(/^#\s+(.+)$/);
      if (h1) novelTitle = h1[1].trim();
    }
  });

  if (headings.length === 0) {
    // Pas de titre de chapitre : le fichier entier est un chapitre,
    // numéroté d'après son nom (chapitre-042.md → 42).
    const base = path.basename(filePath, ".md");
    const numMatch = base.match(/(\d+)(?!.*\d)/);
    if (!numMatch) return { chapters: [], novelTitle, preamble: raw };
    const firstHeading = lines.find((l) => /^#{1,6}\s+/.test(l));
    const title = firstHeading ? firstHeading.replace(/^#{1,6}\s+/, "").trim() : base;
    return {
      chapters: [{ num: parseInt(numMatch[1], 10), title, content: raw }],
      novelTitle,
    };
  }

  const preambleLines = lines.slice(0, headings[0].idx);
  const preamble = preambleLines.join("\n").trim() || undefined;

  const chapters = headings.map((h, i) => {
    const end = i + 1 < headings.length ? headings[i + 1].idx : lines.length;
    let body = lines.slice(h.idx + 1, end).join("\n").trim();
    // Retire un séparateur final juste avant le chapitre suivant.
    body = body.replace(/\n-{3,}\s*$/, "").trim();
    return { num: h.num, title: h.title || `Chapitre ${h.num}`, content: body };
  });

  return { chapters, novelTitle, preamble };
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildNovel(entry: NovelConfigEntry, contents: Map<number, Chapter>): Novel & {
  _contents: Map<number, Chapter>;
} {
  const dir = path.join(ROOT, entry.dir);
  const meta = { ...readNovelJson(dir), ...pruneUndefined(entry) };
  const files = listMarkdownFiles(dir);

  let novelTitle: string | undefined;
  let preamble: string | undefined;

  for (const file of files) {
    if (path.basename(file).toLowerCase() === "readme.md") continue;
    const raw = fs.readFileSync(file, "utf8");
    const parsed = parseFile(file, raw);
    if (!novelTitle && parsed.novelTitle) novelTitle = parsed.novelTitle;
    if (!preamble && parsed.preamble) preamble = parsed.preamble;
    for (const ch of parsed.chapters) {
      const words = countWords(ch.content);
      contents.set(ch.num, {
        num: ch.num,
        title: ch.title,
        slug: "",
        words,
        minutes: Math.max(1, Math.round(words / 220)),
        file: path.relative(ROOT, file),
        content: ch.content,
      });
    }
  }

  const sorted = [...contents.values()].sort((a, b) => a.num - b.num);
  const gaps: Gap[] = [];
  for (let i = 0; i + 1 < sorted.length; i++) {
    if (sorted[i + 1].num > sorted[i].num + 1) {
      gaps.push({ from: sorted[i].num + 1, to: sorted[i + 1].num - 1 });
    }
  }

  const slug = meta.slug ?? slugify(path.basename(entry.dir));
  const chapters: ChapterMeta[] = sorted.map(({ content: _c, ...m }) => ({ ...m, slug }));

  return {
    slug,
    title: meta.title ?? novelTitle ?? path.basename(entry.dir),
    subtitle: meta.subtitle,
    author: meta.author,
    description: meta.description,
    tags: meta.tags ?? [],
    status: meta.status,
    accent: meta.accent,
    plannedChapters: meta.plannedChapters,
    chapterCount: sorted.length,
    totalWords: sorted.reduce((n, c) => n + c.words, 0),
    firstChapter: sorted[0]?.num ?? 0,
    lastChapter: sorted[sorted.length - 1]?.num ?? 0,
    gaps,
    chapters,
    preamble,
    _contents: contents,
  };
}

function pruneUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

const scan = cache(() => {
  const config = readConfig();
  const entries: NovelConfigEntry[] = [...(config.novels ?? [])];
  const contentRoot = path.join(ROOT, config.contentRoot ?? "content");

  if (fs.existsSync(contentRoot)) {
    for (const name of fs.readdirSync(contentRoot).sort()) {
      const dir = path.join(contentRoot, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      if (listMarkdownFiles(dir).length === 0) continue;
      const rel = path.relative(ROOT, dir);
      if (entries.some((e) => e.dir === rel)) continue;
      entries.push({ dir: rel });
    }
  }

  const novels = entries
    .map((e) => buildNovel(e, new Map()))
    .filter((n) => n.chapterCount > 0);
  return novels;
});

export const getLibrary = cache((): Novel[] =>
  scan().map(({ _contents, ...novel }) => novel)
);

export const getNovel = cache((slug: string): Novel | undefined =>
  getLibrary().find((n) => n.slug === slug)
);

export const getChapter = cache(
  (
    slug: string,
    num: number
  ):
    | { novel: Novel; chapter: Chapter; prev?: ChapterMeta; next?: ChapterMeta; gapBefore?: Gap; gapAfter?: Gap }
    | undefined => {
    const full = scan().find((n) => n.slug === slug);
    if (!full) return undefined;
    const chapter = full._contents.get(num);
    if (!chapter) return undefined;
    const { _contents, ...novel } = full;
    const idx = novel.chapters.findIndex((c) => c.num === num);
    const prev = idx > 0 ? novel.chapters[idx - 1] : undefined;
    const next = idx < novel.chapters.length - 1 ? novel.chapters[idx + 1] : undefined;
    const gapBefore = prev && prev.num < num - 1 ? { from: prev.num + 1, to: num - 1 } : undefined;
    const gapAfter = next && next.num > num + 1 ? { from: num + 1, to: next.num - 1 } : undefined;
    return { novel, chapter: { ...chapter, slug }, prev, next, gapBefore, gapAfter };
  }
);
