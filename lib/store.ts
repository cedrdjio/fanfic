"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_ACCENT, DEFAULT_MODE } from "./themes";

export interface ReaderSettings {
  mode: string;
  accent: string;
  font: "serif" | "sans";
  fontSize: number;
  lineHeight: number;
  width: "etroit" | "normal" | "large";
  justify: boolean;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  mode: DEFAULT_MODE,
  accent: DEFAULT_ACCENT,
  font: "serif",
  fontSize: 18,
  lineHeight: 1.75,
  width: "normal",
  justify: false,
};

export interface Progress {
  chapter: number;
  /** Position de défilement dans le chapitre, entre 0 et 1. */
  scroll: number;
  at: number;
}

interface ReaderState {
  settings: ReaderSettings;
  progress: Record<string, Progress>;
  setSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
  resetSettings: () => void;
  saveProgress: (slug: string, chapter: number, scroll: number) => void;
}

export const useReader = create<ReaderState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      progress: {},
      setSetting: (key, value) =>
        set((s) => ({ settings: { ...s.settings, [key]: value } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      saveProgress: (slug, chapter, scroll) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [slug]: { chapter, scroll, at: Date.now() },
          },
        })),
    }),
    { name: "lecteur-fanfic" }
  )
);
