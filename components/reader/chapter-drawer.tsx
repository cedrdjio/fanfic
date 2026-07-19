"use client";

import Link from "next/link";
import { useState } from "react";
import { Drawer } from "vaul";
import { CircleDashed, List } from "lucide-react";
import clsx from "clsx";
import type { ChapterMeta } from "@/lib/types";

interface Props {
  novelSlug: string;
  novelTitle: string;
  chapters: ChapterMeta[];
  currentNum: number;
}

export function ChapterDrawer({ novelSlug, novelTitle, chapters, currentNum }: Props) {
  const [open, setOpen] = useState(false);

  const rows: React.ReactNode[] = [];
  chapters.forEach((chapter, i) => {
    const prev = i > 0 ? chapters[i - 1] : null;
    if (prev && chapter.num > prev.num + 1) {
      const from = prev.num + 1;
      const to = chapter.num - 1;
      rows.push(
        <li
          key={`gap-${chapter.num}`}
          className="flex items-center gap-2 px-4 py-2 text-[0.68rem] text-faint"
        >
          <CircleDashed className="size-3 shrink-0" />
          {from === to ? `Chapitre ${from} à venir` : `Chapitres ${from}–${to} à venir`}
        </li>
      );
    }
    const isCurrent = chapter.num === currentNum;
    rows.push(
      <li key={chapter.num}>
        <Link
          href={`/roman/${novelSlug}/chapitre/${chapter.num}`}
          onClick={() => setOpen(false)}
          aria-current={isCurrent ? "page" : undefined}
          className={clsx(
            "flex items-baseline gap-3 px-4 py-3 transition hover:bg-raised/60",
            isCurrent && "bg-accent-soft"
          )}
        >
          <span
            className={clsx(
              "w-8 shrink-0 text-right text-[0.78rem] font-semibold tabular-nums",
              isCurrent ? "text-accent" : "text-faint"
            )}
          >
            {chapter.num}
          </span>
          <span
            className={clsx(
              "min-w-0 flex-1 truncate text-[0.85rem]",
              isCurrent ? "font-semibold text-ink" : "text-mut"
            )}
          >
            {chapter.title}
          </span>
          <span className="shrink-0 text-[0.65rem] text-faint">{chapter.minutes} min</span>
        </Link>
      </li>
    );
  });

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-mut transition hover:text-ink active:scale-95"
        >
          <List className="size-4" />
          Chapitres
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[82dvh] w-full max-w-lg flex-col rounded-t-2xl border border-b-0 border-line bg-base pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line" />
          <Drawer.Title className="px-5 pb-3 pt-4 text-sm font-semibold text-ink">
            {novelTitle}
            <span className="ml-2 text-[0.7rem] font-normal text-faint">
              {chapters.length} chapitres
            </span>
          </Drawer.Title>
          <ol className="divide-y divide-line/60 overflow-y-auto border-t border-line">{rows}</ol>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
