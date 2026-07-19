# Le Souverain du Dao

> *Fanfiction Naruto — réécriture originale inspirée de « Heaven-Defying Comprehension »*

**Kurogami Shin (黒神 真)** n'est pas né dans le monde ninja. Il y a été jeté, nourrisson, avec les souvenirs intacts d'une autre vie — et un don que ce monde n'a jamais connu : la **Compréhension Défiant les Cieux**, la capacité de saisir instantanément l'essence de toute chose.

Là où les ninjas tissent des signes, il contemple. Là où ils imitent, il crée. Recueilli au bord d'un ruisseau par Tsunade Senju, il devient le premier cultivateur du monde ninja — et il n'a aucune intention de rester le seul.

Général avant vingt ans, assistant du Hokage et maître de la Racine à seize, bâtisseur d'une civilisation nouvelle, Shin ne veut pas seulement le sommet de la puissance. Il veut refaire le monde ninja de fond en comble — ses techniques, ses villes, ses guerres, et jusqu'à son ciel.

---

## Sanctuaire — le lecteur

Ce dépôt embarque **Sanctuaire**, un lecteur web (Next.js 15 + Tailwind 4) pensé pour lire
les fanfics en Markdown : sombre par défaut, adapté au mobile, avec nuances de couleur
personnalisables, reprise de lecture automatique et navigation intelligente entre chapitres
(même quand des chapitres manquent au milieu).

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # build de production
```

### Ajouter un novel

Dépose un dossier de fichiers `.md` dans `content/` — il apparaît automatiquement dans la
bibliothèque. Deux formats de fichiers sont compris :

- **un chapitre par fichier** : `chapitre-042.md` avec un titre `# Chapitre 42 — Titre` ;
- **plusieurs chapitres par fichier** : des titres `## Chapitre N — Titre` découpent le fichier.

Un fichier `novel.json` optionnel dans le dossier fournit les métadonnées
(`title`, `subtitle`, `author`, `description`, `tags`, `status`, `accent`, `plannedChapters`).
Les dossiers hors de `content/` (comme `chapitres/`) se déclarent dans
[`library.config.json`](library.config.json).

### Réglages de lecture

Nuances (Abysse, Encre, Cendre, Sépia nuit, Papier), six couleurs d'accent, police serif ou
sans, taille de texte, interligne, largeur de colonne, justification — tout est sauvegardé
localement, ainsi que la progression de lecture de chaque novel.

## Structure du dépôt

| Dossier | Contenu |
|---|---|
| [`bible/bible.md`](bible/bible.md) | Bible de l'histoire : personnages, système de cultivation, chronologie, règles d'écriture |
| [`bible/plan-100-chapitres.md`](bible/plan-100-chapitres.md) | Plan détaillé des 100 chapitres, arc par arc |
| [`chapitres/`](chapitres/) | Les chapitres, un fichier Markdown par chapitre |
| [`content/`](content/) | Les autres novels de la bibliothèque, un dossier par œuvre |
| `app/`, `components/`, `lib/` | Le lecteur Sanctuaire (Next.js) |

## Conventions d'écriture

- Dialogues entre guillemets français : « … »
- Pensées en *italique*
- Noms de techniques en *italique* : *Art de la Création Universelle*, *Rosée Immortelle aux Neuf Fleurs*
- Paragraphes courts, chapitres de 2 800 à 4 200 mots
- Cohérence stricte avec le canon de Naruto ; toute divergence est expliquée par l'intrigue

## Avertissement

Œuvre de fan, non commerciale. *Naruto* appartient à Masashi Kishimoto.
