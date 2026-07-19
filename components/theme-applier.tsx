"use client";

import { useEffect } from "react";
import { useReader } from "@/lib/store";

/** Reflète le mode et l'accent choisis sur <html>. */
export function ThemeApplier() {
  const mode = useReader((s) => s.settings.mode);
  const accent = useReader((s) => s.settings.accent);

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-mode", mode);
    el.setAttribute("data-accent", accent);
  }, [mode, accent]);

  return null;
}
