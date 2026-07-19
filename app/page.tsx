import { BookMarked } from "lucide-react";
import { getLibrary } from "@/lib/library";
import { LibraryView } from "@/components/library/library-view";
import { SettingsSheet } from "@/components/settings-sheet";

export default function Home() {
  const novels = getLibrary().map(({ preamble: _p, ...n }) => n);

  return (
    <div className="halo min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        <header className="mb-8 flex items-center justify-between gap-4 sm:mb-12">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl border border-accent-line bg-accent-soft text-accent shadow-[0_0_24px_var(--accent-glow)]">
              <BookMarked className="size-5" />
            </div>
            <div>
              <h1 className="font-ui text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Sanctuaire
              </h1>
              <p className="text-[0.72rem] text-faint sm:text-xs">
                Ta bibliothèque de fanfics · {novels.length} œuvre{novels.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <SettingsSheet />
        </header>

        <LibraryView novels={novels} />

        <footer className="mt-16 text-center text-[0.7rem] text-faint">
          Dépose un dossier de fichiers <code className="text-mut">.md</code> dans{" "}
          <code className="text-mut">content/</code> pour ajouter un novel.
        </footer>
      </div>
    </div>
  );
}
