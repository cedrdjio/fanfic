import Link from "next/link";
import { BookX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <BookX className="mx-auto size-10 text-faint" />
        <h1 className="mt-4 font-read text-2xl font-bold text-ink">Page introuvable</h1>
        <p className="mt-2 text-sm text-mut">
          Ce chapitre ou ce novel n'existe pas (ou pas encore).
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[oklch(0.15_0.02_var(--accent-h))] transition hover:brightness-110"
        >
          Retour à la bibliothèque
        </Link>
      </div>
    </div>
  );
}
