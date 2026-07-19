"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Play } from "lucide-react";
import type { NovelMeta } from "@/lib/types";
import { useReader } from "@/lib/store";

export function StartButton({ novel }: { novel: NovelMeta }) {
  const progress = useReader((s) => s.progress[novel.slug]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const resume =
    hydrated && progress && novel.chapters.some((c) => c.num === progress.chapter)
      ? progress
      : null;

  const target = resume ? resume.chapter : novel.firstChapter;

  return (
    <Link
      href={`/roman/${novel.slug}/chapitre/${target}`}
      className="inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[oklch(0.15_0.02_var(--accent-h))] shadow-[0_8px_30px_var(--accent-glow)] transition hover:brightness-110 active:scale-[0.98]"
    >
      {resume ? (
        <>
          <BookOpen className="size-4" />
          Reprendre au chapitre {resume.chapter}
        </>
      ) : (
        <>
          <Play className="size-4" fill="currentColor" />
          Commencer la lecture
        </>
      )}
    </Link>
  );
}
