"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  Play,
  ScrollText,
} from "lucide-react";
import type { NovelMeta } from "@/lib/types";
import { useReader, type Progress } from "@/lib/store";
import { accentColor } from "@/lib/themes";
import { formatMinutes, formatWords } from "@/lib/format";

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

function novelHue(novel: NovelMeta, index: number): string {
  const fallback = ["violet", "or", "jade", "azur", "rose", "braise"];
  return novel.accent ?? fallback[index % fallback.length];
}

function ContinueCard({ novels }: { novels: NovelMeta[] }) {
  const progress = useReader((s) => s.progress);
  const hydrated = useHydrated();
  if (!hydrated) return null;

  let latest: { novel: NovelMeta; p: Progress } | null = null;
  for (const novel of novels) {
    const p = progress[novel.slug];
    if (p && novel.chapters.some((c) => c.num === p.chapter)) {
      if (!latest || p.at > latest.p.at) latest = { novel, p };
    }
  }
  if (!latest) return null;

  const { novel, p } = latest;
  const chapter = novel.chapters.find((c) => c.num === p.chapter)!;
  const pct = Math.round(p.scroll * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-8"
    >
      <Link
        href={`/roman/${novel.slug}/chapitre/${chapter.num}`}
        className="group relative block overflow-hidden rounded-2xl border border-accent-line bg-surface p-4 transition hover:border-accent sm:p-5"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.16] transition group-hover:opacity-25"
          style={{
            background: `radial-gradient(120% 160% at 0% 0%, ${accentColor(novelHue(novel, 0))}, transparent 55%)`,
          }}
        />
        <div className="relative flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Play className="ml-0.5 size-5" fill="currentColor" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent">
              Reprendre la lecture
            </p>
            <p className="truncate font-medium text-ink">
              {novel.title}
            </p>
            <p className="truncate text-xs text-mut">
              Chapitre {chapter.num} — {chapter.title} · {pct}%
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
        <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${Math.max(2, pct)}%` }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

function NovelCard({ novel, index }: { novel: NovelMeta; index: number }) {
  const progress = useReader((s) => s.progress[novel.slug]);
  const hydrated = useHydrated();
  const hue = novelHue(novel, index);
  const glow = accentColor(hue);
  const minutes = Math.max(1, Math.round(novel.totalWords / 220));

  const readCount =
    hydrated && progress
      ? novel.chapters.filter((c) => c.num < progress.chapter).length +
        (progress.scroll > 0.98 ? 1 : 0)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
    >
      <Link
        href={`/roman/${novel.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-faint hover:shadow-[var(--shadow)]"
      >
        <div
          className="relative h-28 overflow-hidden sm:h-32"
          style={{
            background: `linear-gradient(135deg, ${glow} -40%, transparent 60%), radial-gradient(100% 140% at 100% 0%, ${glow} -60%, transparent 50%)`,
          }}
        >
          <span
            aria-hidden
            className="absolute -right-3 -top-6 select-none font-read text-[7rem] font-bold leading-none opacity-[0.13]"
            style={{ color: glow }}
          >
            {novel.title.replace(/^(Le |La |L'|Les )/i, "").charAt(0)}
          </span>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--surface)] to-transparent" />
          <div className="absolute bottom-2.5 left-4 flex flex-wrap gap-1.5">
            {novel.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-base/70 px-2 py-0.5 text-[0.62rem] font-medium text-mut backdrop-blur"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 pt-2.5 sm:p-5 sm:pt-3">
          <h2 className="font-ui text-lg font-bold leading-snug text-ink transition group-hover:text-accent">
            {novel.title}
          </h2>
          {novel.subtitle && (
            <p className="mt-0.5 text-[0.72rem] text-faint">{novel.subtitle}</p>
          )}
          {novel.description && (
            <p className="mt-2.5 line-clamp-3 text-[0.82rem] leading-relaxed text-mut">
              {novel.description}
            </p>
          )}

          <div className="mt-auto pt-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.72rem] text-faint">
              <span className="inline-flex items-center gap-1.5">
                <ScrollText className="size-3.5" />
                {novel.chapterCount} chapitre{novel.chapterCount > 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-3.5" />
                {formatWords(novel.totalWords)} mots
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {formatMinutes(minutes)}
              </span>
            </div>

            {hydrated && progress ? (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[0.65rem] text-faint">
                  <span className="inline-flex items-center gap-1 text-accent">
                    <BookOpen className="size-3" />
                    Chapitre {progress.chapter}
                  </span>
                  <span>
                    {readCount}/{novel.chapterCount} lus
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.max(3, Math.round((readCount / novel.chapterCount) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-3 h-[26px]" aria-hidden />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function LibraryView({ novels }: { novels: NovelMeta[] }) {
  return (
    <>
      <ContinueCard novels={novels} />
      <div className="grid gap-4 sm:grid-cols-2">
        {novels.map((novel, i) => (
          <NovelCard key={novel.slug} novel={novel} index={i} />
        ))}
      </div>
    </>
  );
}
