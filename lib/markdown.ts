import type { Block, Inline, ParagraphKind } from "./types";

/**
 * Parseur Markdown minimal, taillé pour la prose des fanfics :
 * titres, séparateurs, blockquotes (dont messages Système), paragraphes,
 * emphase (*italique*, **gras**, ***les deux***).
 */

const SYSTEM_RE = /^\*{0,2}\{\s*(.*?)\s*\}\*{0,2}$/;

export function parseInlines(raw: string): Inline[] {
  const out: Inline[] = [];
  const re = /(\*\*\*(?:[^*]|\*(?!\*\*))+?\*\*\*|\*\*(?:[^*]|\*(?!\*))+?\*\*|\*[^*\n]+?\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) out.push({ t: "text", s: raw.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("***")) out.push({ t: "emstrong", s: tok.slice(3, -3) });
    else if (tok.startsWith("**")) out.push({ t: "strong", s: tok.slice(2, -2) });
    else out.push({ t: "em", s: tok.slice(1, -1) });
    last = m.index + tok.length;
  }
  if (last < raw.length) out.push({ t: "text", s: raw.slice(last) });
  return out;
}

function paragraphKind(raw: string, inlines: Inline[]): ParagraphKind {
  const trimmed = raw.trim();
  if (/^\*Fin (du|des) chapitre/i.test(trimmed) || /^\*{1,2}À suivre/i.test(trimmed)) return "note";
  if (inlines.length === 1 && inlines[0].t === "strong" && /^«/.test(inlines[0].s)) return "shout";
  if (/^«/.test(trimmed)) return "dialogue";
  if (inlines.length === 1 && inlines[0].t === "em") return "thought";
  return "normal";
}

function makeParagraph(raw: string): Block {
  const trimmed = raw.trim();
  const sys = trimmed.match(SYSTEM_RE);
  if (sys) return { t: "system", lines: [parseInlines(sys[1])] };
  const inlines = parseInlines(trimmed);
  return { t: "p", kind: paragraphKind(trimmed, inlines), inlines };
}

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let quote: string[] | null = null;

  const flushPara = () => {
    if (para.length > 0) {
      blocks.push(makeParagraph(para.join(" ")));
      para = [];
    }
  };

  const flushQuote = () => {
    if (quote !== null) {
      blocks.push(makeQuote(quote));
      quote = null;
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (t === "") {
      flushPara();
      flushQuote();
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      flushPara();
      flushQuote();
      blocks.push({ t: "hr" });
      continue;
    }
    if (t.startsWith(">")) {
      flushPara();
      if (quote === null) quote = [];
      quote.push(t.replace(/^>\s?/, ""));
      continue;
    }
    flushQuote();
    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      blocks.push({ t: "heading", level: h[1].length, inlines: parseInlines(h[2].trim()) });
      continue;
    }
    para.push(t);
  }
  flushPara();
  flushQuote();
  return blocks;
}

function makeQuote(rawLines: string[]): Block {
  // Regroupe les lignes du blockquote en paragraphes séparés par des lignes vides.
  const paras: string[] = [];
  let cur: string[] = [];
  for (const l of rawLines) {
    if (l.trim() === "") {
      if (cur.length) paras.push(cur.join(" "));
      cur = [];
    } else cur.push(l.trim());
  }
  if (cur.length) paras.push(cur.join(" "));

  const systemLines = paras
    .map((p) => p.match(SYSTEM_RE))
    .filter((m): m is RegExpMatchArray => m !== null);

  // Si tout le blockquote est fait de messages { … } → panneau Système.
  if (systemLines.length > 0 && systemLines.length === paras.length) {
    return { t: "system", lines: systemLines.map((m) => parseInlines(m[1])) };
  }

  const inner: Block[] = paras.map((p) => makeParagraph(p));
  return { t: "quote", blocks: inner };
}

export function countWords(src: string): number {
  return src.split(/\s+/).filter(Boolean).length;
}
