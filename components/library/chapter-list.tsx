"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronRight, CircleDashed, Clock } from "lucide-react";
import clsx from "clsx";
import type { NovelMeta } from "@/lib/types";
import { useReader } from "@/lib/store";

function GapRow({ from, to }: { from: number; to: number }) {
  return (
    <li className="flex items-center gap-3 px-4 py-2.5 text-[0.72rem] text-faint">
      <CircleDashed className="size-3.5 shrink-0" />
      {from === to
        ? `Chapitre ${from} pas encore ajouté`
        : `Chapitres ${from} à ${to} pas encore ajoutés`}
      <span className="h-px flex-1 border-t border-dashed border-line" />
    </li>
  );
}

export function ChapterList({ novel }: { novel: NovelMeta }) {
  const progress = useReader((s) => s.progress[novel.slug]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const current = hydrated && progress ? progress.chapter : null;

  const rows: React.ReactNode[] = [];
  novel.chapters.forEach((chapter, i) => {
    const prev = i > 0 ? novel.chapters[i - 1] : null;
    if (prev && chapter.num > prev.num + 1) {
      rows.push(<GapRow key={`gap-${chapter.num}`} from={prev.num + 1} to={chapter.num - 1} />);
    }
    const isRead =
      current !== null && (chapter.num < current || (chapter.num === current && progress!.scroll > 0.98));
    const isCurrent = current === chapter.num && !isRead;

    rows.push(
      <li key={chapter.num}>
        <Link
          href={`/roman/${novel.slug}/chapitre/${chapter.num}`}
          className={clsx(
            "group flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-raised/60",
            isCurrent && "bg-accent-soft"
          )}
        >
          <span
            className={clsx(
              "grid size-9 shrink-0 place-items-center rounded-xl border text-[0.78rem] font-semibold tabular-nums",
              isRead
                ? "border-transparent bg-raised text-faint"
                : isCurrent
                  ? "border-accent-line bg-accent-soft text-accent"
                  : "border-line bg-surface text-mut"
            )}
          >
            {isRead ? <Check className="size-4" /> : chapter.num}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={clsx(
                "block truncate text-[0.88rem] font-medium",
                isRead ? "text-faint" : "text-ink"
              )}
            >
              {chapter.title}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-faint">
              <Clock className="size-3" />
              {chapter.minutes} min
              {isCurrent && progress && (
                <span className="text-accent">· en cours — {Math.round(progress.scroll * 100)}%</span>
              )}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-accent" />
        </Link>
      </li>
    );
  });

  return (
    <section>
      <h2 className="mb-3 px-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">
        Chapitres
      </h2>
      <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface/70">
        {rows}
      </ol>
    </section>
  );
}
