export interface ModeDef {
  id: string;
  label: string;
  hint: string;
  /** Couleurs d'aperçu pour les pastilles du sélecteur. */
  swatch: { bg: string; fg: string };
  dark: boolean;
}

export const MODES: ModeDef[] = [
  {
    id: "abysse",
    label: "Abysse",
    hint: "Noir violacé, contraste doux",
    swatch: { bg: "oklch(0.16 0.02 295)", fg: "oklch(0.89 0.012 290)" },
    dark: true,
  },
  {
    id: "encre",
    label: "Encre",
    hint: "Bleu nuit profond",
    swatch: { bg: "oklch(0.17 0.025 255)", fg: "oklch(0.89 0.01 250)" },
    dark: true,
  },
  {
    id: "cendre",
    label: "Cendre",
    hint: "Gris feutré, très reposant",
    swatch: { bg: "oklch(0.2 0.005 270)", fg: "oklch(0.85 0.005 270)" },
    dark: true,
  },
  {
    id: "sepia-nuit",
    label: "Sépia nuit",
    hint: "Brun chaud pour lire tard",
    swatch: { bg: "oklch(0.18 0.015 60)", fg: "oklch(0.87 0.025 80)" },
    dark: true,
  },
  {
    id: "papier",
    label: "Papier",
    hint: "Clair sépia, lecture de jour",
    swatch: { bg: "oklch(0.96 0.012 85)", fg: "oklch(0.3 0.02 60)" },
    dark: false,
  },
];

export interface AccentDef {
  id: string;
  label: string;
  /** Chroma / teinte oklch — la luminosité vient du mode. */
  c: number;
  h: number;
}

export const ACCENTS: AccentDef[] = [
  { id: "violet", label: "Violet", c: 0.16, h: 295 },
  { id: "or", label: "Or", c: 0.125, h: 85 },
  { id: "jade", label: "Jade", c: 0.115, h: 165 },
  { id: "azur", label: "Azur", c: 0.12, h: 235 },
  { id: "rose", label: "Rose", c: 0.14, h: 350 },
  { id: "braise", label: "Braise", c: 0.15, h: 40 },
];

export const DEFAULT_MODE = "abysse";
export const DEFAULT_ACCENT = "violet";

export function accentColor(id: string, light = 0.72): string {
  const a = ACCENTS.find((x) => x.id === id) ?? ACCENTS[0];
  return `oklch(${light} ${a.c} ${a.h})`;
}
