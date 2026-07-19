"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import {
  AlignJustify,
  AlignLeft,
  Check,
  Minus,
  Palette,
  Plus,
  RotateCcw,
  Settings2,
} from "lucide-react";
import clsx from "clsx";
import { useReader, DEFAULT_SETTINGS } from "@/lib/store";
import { ACCENTS, MODES, accentColor } from "@/lib/themes";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-faint">
      {children}
    </h3>
  );
}

function Stepper({
  value,
  display,
  onChange,
  min,
  max,
  step,
  label,
}: {
  value: number;
  display: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2">
      <span className="text-sm text-mut">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Réduire ${label}`}
          onClick={() => onChange(clamp(value - step))}
          className="grid size-8 place-items-center rounded-lg text-mut transition hover:bg-raised hover:text-ink active:scale-95"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-12 text-center text-sm font-medium tabular-nums text-ink">
          {display}
        </span>
        <button
          type="button"
          aria-label={`Augmenter ${label}`}
          onClick={() => onChange(clamp(value + step))}
          className="grid size-8 place-items-center rounded-lg text-mut transition hover:bg-raised hover:text-ink active:scale-95"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function SettingsSheet({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const settings = useReader((s) => s.settings);
  const setSetting = useReader((s) => s.setSetting);
  const resetSettings = useReader((s) => s.resetSettings);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label="Réglages de lecture"
            className="grid size-10 place-items-center rounded-full border border-line bg-surface/80 text-mut backdrop-blur transition hover:text-ink active:scale-95"
          >
            <Settings2 className="size-[18px]" />
          </button>
        )}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-2xl border border-b-0 border-line bg-base pb-[env(safe-area-inset-bottom)]"
        >
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-line" />
          <div className="overflow-y-auto px-5 pb-8 pt-4">
            <div className="mb-5 flex items-center justify-between">
              <Drawer.Title className="flex items-center gap-2 text-base font-semibold text-ink">
                <Palette className="size-4 text-accent" />
                Apparence
              </Drawer.Title>
              <button
                type="button"
                onClick={resetSettings}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-faint transition hover:text-ink"
              >
                <RotateCcw className="size-3.5" />
                Réinitialiser
              </button>
            </div>

            <section className="mb-6">
              <SectionTitle>Nuance</SectionTitle>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSetting("mode", m.id)}
                    className={clsx(
                      "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition active:scale-[0.98]",
                      settings.mode === m.id
                        ? "border-accent bg-accent-soft"
                        : "border-line bg-surface hover:border-faint"
                    )}
                  >
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-[0.65rem] font-bold"
                      style={{ background: m.swatch.bg, color: m.swatch.fg }}
                    >
                      Aa
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.8rem] font-medium text-ink">
                        {m.label}
                      </span>
                      <span className="block truncate text-[0.65rem] text-faint">{m.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-6">
              <SectionTitle>Accent</SectionTitle>
              <div className="flex flex-wrap gap-2.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-label={`Accent ${a.label}`}
                    title={a.label}
                    onClick={() => setSetting("accent", a.id)}
                    className={clsx(
                      "relative grid size-10 place-items-center rounded-full transition active:scale-95",
                      settings.accent === a.id
                        ? "ring-2 ring-accent ring-offset-2 ring-offset-base"
                        : "ring-1 ring-line"
                    )}
                    style={{ background: accentColor(a.id) }}
                  >
                    {settings.accent === a.id && (
                      <Check className="size-4 text-black/70" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-2">
              <SectionTitle>Lecture</SectionTitle>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSetting("font", "serif")}
                  className={clsx(
                    "rounded-xl border px-3 py-2.5 transition active:scale-[0.98]",
                    settings.font === "serif"
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:border-faint"
                  )}
                >
                  <span className="font-read text-lg text-ink">Aa</span>
                  <span className="block text-[0.68rem] text-faint">Serif — immersif</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSetting("font", "sans")}
                  className={clsx(
                    "rounded-xl border px-3 py-2.5 transition active:scale-[0.98]",
                    settings.font === "sans"
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:border-faint"
                  )}
                >
                  <span className="font-ui text-lg text-ink">Aa</span>
                  <span className="block text-[0.68rem] text-faint">Sans — moderne</span>
                </button>
              </div>

              <Stepper
                label="Taille du texte"
                value={settings.fontSize}
                display={`${settings.fontSize}px`}
                onChange={(v) => setSetting("fontSize", v)}
                min={15}
                max={24}
                step={1}
              />
              <Stepper
                label="Interligne"
                value={settings.lineHeight}
                display={settings.lineHeight.toFixed(2)}
                onChange={(v) => setSetting("lineHeight", v)}
                min={1.4}
                max={2.2}
                step={0.05}
              />

              <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2">
                <span className="text-sm text-mut">Largeur de colonne</span>
                <div className="flex gap-1">
                  {(
                    [
                      ["etroit", "Étroite"],
                      ["normal", "Normale"],
                      ["large", "Large"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSetting("width", id)}
                      className={clsx(
                        "rounded-lg px-2.5 py-1.5 text-xs font-medium transition active:scale-95",
                        settings.width === id
                          ? "bg-accent-soft text-accent"
                          : "text-faint hover:text-ink"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSetting("justify", !settings.justify)}
                className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5 transition active:scale-[0.99]"
              >
                <span className="flex items-center gap-2 text-sm text-mut">
                  {settings.justify ? (
                    <AlignJustify className="size-4" />
                  ) : (
                    <AlignLeft className="size-4" />
                  )}
                  Texte justifié
                </span>
                <span
                  className={clsx(
                    "relative h-6 w-10 rounded-full transition",
                    settings.justify ? "bg-accent/80" : "bg-raised"
                  )}
                >
                  <span
                    className={clsx(
                      "absolute top-0.5 size-5 rounded-full bg-ink transition-all",
                      settings.justify ? "left-[18px]" : "left-0.5"
                    )}
                  />
                </span>
              </button>
            </section>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
