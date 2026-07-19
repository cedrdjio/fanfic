import type { Block, Inline } from "@/lib/types";
import { Sparkles } from "lucide-react";

function Inlines({ inlines }: { inlines: Inline[] }) {
  return (
    <>
      {inlines.map((inl, i) => {
        switch (inl.t) {
          case "em":
            return <em key={i}>{inl.s}</em>;
          case "strong":
            return <strong key={i}>{inl.s}</strong>;
          case "emstrong":
            return (
              <strong key={i}>
                <em>{inl.s}</em>
              </strong>
            );
          default:
            return <span key={i}>{inl.s}</span>;
        }
      })}
    </>
  );
}

function SystemPanel({ lines }: { lines: Inline[][] }) {
  return (
    <aside className="not-prose relative my-7 overflow-hidden rounded-xl border border-accent-line bg-accent-soft px-4 py-3.5 sm:px-5">
      <div className="mb-2 flex items-center gap-1.5 font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent">
        <Sparkles className="size-3.5" aria-hidden />
        Système
      </div>
      <div className="space-y-2.5">
        {lines.map((line, i) => (
          <p key={i} className="text-[0.92em] leading-relaxed text-ink/90">
            <Inlines inlines={line} />
          </p>
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
      />
    </aside>
  );
}

function Paragraph({ block }: { block: Extract<Block, { t: "p" }> }) {
  switch (block.kind) {
    case "dialogue":
      return (
        <p className="text-ink">
          <Inlines inlines={block.inlines} />
        </p>
      );
    case "thought":
      return (
        <p className="text-mut">
          <Inlines inlines={block.inlines} />
        </p>
      );
    case "shout":
      return (
        <p className="font-semibold tracking-wide text-ink">
          <Inlines inlines={block.inlines} />
        </p>
      );
    case "note":
      return (
        <p className="text-center text-[0.85em] italic text-faint">
          <Inlines inlines={block.inlines} />
        </p>
      );
    default:
      return (
        <p>
          <Inlines inlines={block.inlines} />
        </p>
      );
  }
}

function Divider() {
  return (
    <div className="not-prose my-9 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-line" />
      <span className="size-1.5 rotate-45 rounded-[2px] bg-accent/70" />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-line" />
    </div>
  );
}

export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "heading": {
            const cls =
              b.level <= 2
                ? "mt-10 font-ui text-[1.25em] font-bold text-ink"
                : "mt-8 font-ui text-[1.05em] font-semibold text-mut";
            return (
              <h2 key={i} className={cls}>
                <Inlines inlines={b.inlines} />
              </h2>
            );
          }
          case "hr":
            return <Divider key={i} />;
          case "system":
            return <SystemPanel key={i} lines={b.lines} />;
          case "quote":
            return (
              <blockquote
                key={i}
                className="not-prose my-7 space-y-2.5 rounded-r-xl border-l-2 border-accent/60 bg-surface/70 px-4 py-3.5 text-[0.93em] text-mut sm:px-5"
              >
                <Prose blocks={b.blocks} />
              </blockquote>
            );
          default:
            return <Paragraph key={i} block={b} />;
        }
      })}
    </>
  );
}
