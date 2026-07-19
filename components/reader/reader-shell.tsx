"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import type { ChapterMeta, Gap } from "@/lib/types";
import { useReader } from "@/lib/store";
import { ChapterDrawer } from "./chapter-drawer";
import { SettingsSheet } from "@/components/settings-sheet";

interface ChapterRef {
  num: number;
  title: string;
}

interface Props {
  novelSlug: string;
  novelTitle: string;
  chapters: ChapterMeta[];
  chapter: { num: number; title: string; words: number; minutes: number };
  prev: ChapterRef | null;
  next: ChapterRef | null;
  gapBefore: Gap | null;
  gapAfter: Gap | null;
  children: React.ReactNode;
}

const WIDTHS: Record<string, string> = {
  etroit: "max-w-[34rem]",
  normal: "max-w-[42rem]",
  large: "max-w-[54rem]",
};

function GapNotice({ gap }: { gap: Gap }) {
  return (
    <p className="flex items-center justify-center gap-2 text-center text-[0.72rem] text-faint">
      <CircleDashed className="size-3.5 shrink-0" />
      {gap.from === gap.to
        ? `Le chapitre ${gap.from} n'a pas encore été ajouté`
        : `Les chapitres ${gap.from} à ${gap.to} n'ont pas encore été ajoutés`}
    </p>
  );
}

export function ReaderShell({
  novelSlug,
  novelTitle,
  chapters,
  chapter,
  prev,
  next,
  gapBefore,
  gapAfter,
  children,
}: Props) {
  const router = useRouter();
  const settings = useReader((s) => s.settings);
  const saveProgress = useReader((s) => s.saveProgress);
  const storedProgress = useReader((s) => s.progress[novelSlug]);

  const [hydrated, setHydrated] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [pct, setPct] = useState(0);
  const lastY = useRef(0);
  const restored = useRef(false);
  const ticking = useRef(false);

  useEffect(() => setHydrated(true), []);

  // Restaure la position de lecture si on revient sur le chapitre en cours.
  useEffect(() => {
    if (!hydrated || restored.current) return;
    restored.current = true;
    if (storedProgress && storedProgress.chapter === chapter.num && storedProgress.scroll > 0.02) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: storedProgress.scroll * max });
    } else {
      window.scrollTo({ top: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Suivi du défilement : progression + chrome auto-masquant + sauvegarde.
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const frac = max > 0 ? Math.min(1, Math.max(0, y / max)) : 1;
        setPct(frac);

        const delta = y - lastY.current;
        if (y < 80 || delta < -12) setChrome(true);
        else if (delta > 12 && y > 160) setChrome(false);
        if (Math.abs(delta) > 12) lastY.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sauvegarde périodique de la progression.
  useEffect(() => {
    if (!hydrated) return;
    const id = setInterval(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const frac = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
      saveProgress(novelSlug, chapter.num, frac);
    }, 2000);
    return () => clearInterval(id);
  }, [hydrated, novelSlug, chapter.num, saveProgress]);

  const goTo = useCallback(
    (ref: ChapterRef | null) => {
      if (!ref) return;
      saveProgress(novelSlug, ref.num, 0);
      router.push(`/roman/${novelSlug}/chapitre/${ref.num}`);
    },
    [router, novelSlug, saveProgress]
  );

  // Navigation clavier ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft" && prev) goTo(prev);
      if (e.key === "ArrowRight" && next) goTo(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, goTo]);

  const fontFamily =
    settings.font === "serif"
      ? "var(--font-read), Georgia, serif"
      : "var(--font-ui), system-ui, sans-serif";

  return (
    <div className="min-h-dvh">
      {/* Barre de progression */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full bg-accent transition-[width] duration-150"
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      {/* Barre supérieure */}
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-md transition-transform duration-300",
          !chrome && "-translate-y-full"
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-3 sm:px-6">
          <Link
            href={`/roman/${novelSlug}`}
            aria-label="Retour au sommaire"
            className="grid size-10 shrink-0 place-items-center rounded-full text-mut transition hover:bg-raised hover:text-ink"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[0.68rem] uppercase tracking-[0.14em] text-faint">
              {novelTitle}
            </p>
            <p className="truncate text-[0.82rem] font-medium text-ink">
              Chapitre {chapter.num} · {chapter.title}
            </p>
          </div>
          <SettingsSheet
            trigger={
              <button
                type="button"
                aria-label="Réglages de lecture"
                className="grid size-10 shrink-0 place-items-center rounded-full text-mut transition hover:bg-raised hover:text-ink"
              >
                <Sparkles className="size-[18px]" />
              </button>
            }
          />
        </div>
      </header>

      {/* Contenu */}
      <main
        className={clsx("mx-auto w-full px-5 pb-40 pt-24 sm:px-6", WIDTHS[settings.width])}
        onClick={() => setChrome((c) => !c)}
      >
        <div className="mb-10 text-center">
          {gapBefore && (
            <div className="mb-6">
              <GapNotice gap={gapBefore} />
            </div>
          )}
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent">
            Chapitre {chapter.num}
          </p>
          <h1 className="mx-auto mt-2 max-w-xl font-read text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {chapter.title}
          </h1>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.72rem] text-faint">
            <Clock className="size-3" />
            {chapter.minutes} min · {chapter.words.toLocaleString("fr-FR")} mots
          </p>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-line" />
            <span className="size-1.5 rotate-45 rounded-[2px] bg-accent/70" />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-line" />
          </div>
        </div>

        <article
          className="prose-read text-ink/95"
          style={{
            fontFamily,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            textAlign: settings.justify ? "justify" : "left",
          }}
        >
          {children}
        </article>

        {/* Fin de chapitre */}
        <footer className="mt-16 border-t border-line pt-8" onClick={(e) => e.stopPropagation()}>
          {gapAfter && (
            <div className="mb-5">
              <GapNotice gap={gapAfter} />
            </div>
          )}
          {next ? (
            <button
              type="button"
              onClick={() => goTo(next)}
              className="group flex w-full items-center gap-4 rounded-2xl border border-accent-line bg-accent-soft p-4 text-left transition hover:brightness-110 active:scale-[0.99] sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent">
                  Chapitre suivant
                </p>
                <p className="mt-1 truncate font-read text-lg font-semibold text-ink">
                  {next.num}. {next.title}
                </p>
              </div>
              <ChevronRight className="size-6 shrink-0 text-accent transition group-hover:translate-x-1" />
            </button>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center">
              <p className="font-read text-lg font-semibold text-ink">
                Tu as atteint la fin des chapitres disponibles
              </p>
              <p className="mt-1.5 text-sm text-mut">
                Ajoute de nouveaux fichiers .md dans le dossier du novel pour continuer l'histoire.
              </p>
              <Link
                href={`/roman/${novelSlug}`}
                className="mt-5 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[oklch(0.15_0.02_var(--accent-h))] transition hover:brightness-110"
              >
                Retour au sommaire
              </Link>
            </div>
          )}
        </footer>
      </main>

      {/* Barre inférieure */}
      <nav
        className={clsx(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-300",
          !chrome && "translate-y-full"
        )}
      >
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-2 px-3 sm:px-6">
          <button
            type="button"
            disabled={!prev}
            onClick={() => goTo(prev)}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mut transition enabled:hover:bg-raised enabled:hover:text-ink disabled:opacity-35"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">Préc.</span>
          </button>

          <ChapterDrawer
            novelSlug={novelSlug}
            novelTitle={novelTitle}
            chapters={chapters}
            currentNum={chapter.num}
          />

          <button
            type="button"
            disabled={!next}
            onClick={() => goTo(next)}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mut transition enabled:hover:bg-raised enabled:hover:text-ink disabled:opacity-35"
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="sm:hidden">Suiv.</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </nav>
    </div>
  );
}
