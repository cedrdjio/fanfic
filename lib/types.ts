export type Inline =
  | { t: "text"; s: string }
  | { t: "em"; s: string }
  | { t: "strong"; s: string }
  | { t: "emstrong"; s: string };

export type ParagraphKind = "normal" | "dialogue" | "thought" | "shout" | "note";

export type Block =
  | { t: "heading"; level: number; inlines: Inline[] }
  | { t: "p"; kind: ParagraphKind; inlines: Inline[] }
  | { t: "system"; lines: Inline[][] }
  | { t: "quote"; blocks: Block[] }
  | { t: "hr" };

export interface ChapterMeta {
  num: number;
  title: string;
  slug: string;
  words: number;
  minutes: number;
  file: string;
}

export interface Chapter extends ChapterMeta {
  content: string;
}

export interface Gap {
  from: number;
  to: number;
}

export interface NovelMeta {
  slug: string;
  title: string;
  subtitle?: string;
  author?: string;
  description?: string;
  tags: string[];
  status?: string;
  accent?: string;
  plannedChapters?: number;
  chapterCount: number;
  totalWords: number;
  firstChapter: number;
  lastChapter: number;
  gaps: Gap[];
  chapters: ChapterMeta[];
}

export interface Novel extends NovelMeta {
  preamble?: string;
}
