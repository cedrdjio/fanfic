import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Clock, FileText, ScrollText, User } from "lucide-react";
import { getLibrary, getNovel } from "@/lib/library";
import { parseMarkdown } from "@/lib/markdown";
import { accentColor } from "@/lib/themes";
import { formatMinutes, formatWords } from "@/lib/format";
import { Prose } from "@/components/prose";
import { SettingsSheet } from "@/components/settings-sheet";
import { ChapterList } from "@/components/library/chapter-list";
import { StartButton } from "@/components/library/start-button";

export function generateStaticParams() {
  return getLibrary().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const novel = getNovel(slug);
  return { title: novel?.title ?? "Novel introuvable" };
}

export default async function NovelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const novel = getNovel(slug);
  if (!novel) notFound();

  const glow = accentColor(novel.accent ?? "violet");
  const minutes = Math.max(1, Math.round(novel.totalWords / 220));
  const preambleBlocks = novel.preamble ? parseMarkdown(novel.preamble) : null;

  return (
    <div className="min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background: `radial-gradient(90% 100% at 50% 0%, ${glow} -75%, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-3xl px-4 pb-24 pt-5 sm:px-6">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-line bg-surface/80 py-2 pl-3 pr-4 text-sm text-mut backdrop-blur transition hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Bibliothèque
          </Link>
          <SettingsSheet />
        </header>

        <div className="mb-8">
          {novel.status && (
            <span className="mb-3 inline-block rounded-full border border-accent-line bg-accent-soft px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent">
              {novel.status}
            </span>
          )}
          <h1 className="font-read text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {novel.title}
          </h1>
          {novel.subtitle && <p className="mt-2 text-sm text-faint">{novel.subtitle}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.78rem] text-mut">
            {novel.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5 text-faint" />
                {novel.author}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <ScrollText className="size-3.5 text-faint" />
              {novel.chapterCount} chapitres
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-3.5 text-faint" />
              {formatWords(novel.totalWords)} mots
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-faint" />
              ≈ {formatMinutes(minutes)} de lecture
            </span>
          </div>

          {novel.description && (
            <p className="mt-5 max-w-2xl text-[0.92rem] leading-relaxed text-mut">
              {novel.description}
            </p>
          )}

          <div className="mt-6">
            <StartButton novel={novel} />
          </div>
        </div>

        {preambleBlocks && (
          <details className="group mb-8 rounded-2xl border border-line bg-surface/70">
            <summary className="cursor-pointer select-none list-none px-5 py-3.5 text-sm font-medium text-mut transition hover:text-ink [&::-webkit-details-marker]:hidden">
              Note de lecture & légende
              <span className="float-right text-faint transition group-open:rotate-180">▾</span>
            </summary>
            <div className="prose-read border-t border-line px-5 py-4 text-[0.9rem] leading-relaxed text-mut">
              <Prose blocks={preambleBlocks} />
            </div>
          </details>
        )}

        <ChapterList novel={novel} />
      </div>
    </div>
  );
}
