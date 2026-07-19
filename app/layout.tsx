import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { ThemeApplier } from "@/components/theme-applier";
import { DEFAULT_ACCENT, DEFAULT_MODE } from "@/lib/themes";
import "./globals.css";

const fontUi = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const fontRead = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-read",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sanctuaire — Lecteur de fanfics",
    template: "%s · Sanctuaire",
  },
  description: "Bibliothèque et lecteur de fanfictions en Markdown.",
};

export const viewport: Viewport = {
  themeColor: "#151221",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeInit = `try{var s=JSON.parse(localStorage.getItem("lecteur-fanfic")||"{}");var g=s.state&&s.state.settings;if(g){if(g.mode)document.documentElement.setAttribute("data-mode",g.mode);if(g.accent)document.documentElement.setAttribute("data-accent",g.accent);}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      data-mode={DEFAULT_MODE}
      data-accent={DEFAULT_ACCENT}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${fontUi.variable} ${fontRead.variable} antialiased`}>
        <ThemeApplier />
        {children}
      </body>
    </html>
  );
}
