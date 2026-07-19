import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChapter, getLibrary } from "@/lib/library";
import { parseMarkdown } from "@/lib/markdown";
import { Prose } from "@/components/prose";
import { ReaderShell } from "@/components/reader/reader-shell";

export function generateStaticParams() {
  return getLibrary().flatMap((n) =>
    n.chapters.map((c) => ({ slug: n.slug, num: String(c.num) }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; num: string }>;
}): Promise<Metadata> {
  const { slug, num } = await params;
  const data = getChapter(slug, parseInt(num, 10));
  if (!data) return { title: "Chapitre introuvable" };
  return { title: `Chapitre ${data.chapter.num} — ${data.chapter.title}` };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; num: string }>;
}) {
  const { slug, num } = await params;
  const parsed = parseInt(num, 10);
  if (Number.isNaN(parsed)) notFound();
  const data = getChapter(slug, parsed);
  if (!data) notFound();

  const { novel, chapter, prev, next, gapBefore, gapAfter } = data;
  const blocks = parseMarkdown(chapter.content);

  return (
    <ReaderShell
      novelSlug={novel.slug}
      novelTitle={novel.title}
      chapters={novel.chapters}
      chapter={{ num: chapter.num, title: chapter.title, words: chapter.words, minutes: chapter.minutes }}
      prev={prev ? { num: prev.num, title: prev.title } : null}
      next={next ? { num: next.num, title: next.title } : null}
      gapBefore={gapBefore ?? null}
      gapAfter={gapAfter ?? null}
    >
      <Prose blocks={blocks} />
    </ReaderShell>
  );
}
