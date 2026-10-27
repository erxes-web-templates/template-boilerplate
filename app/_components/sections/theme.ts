/**
 * Tokens a section's colours (set in the builder) also override: text tokens
 * take the text colour, surface tokens a lift of the background so panels
 * inside the section follow it.
 *
 * This template's copy uses the theme tokens (text-foreground /
 * text-muted-foreground), which are always set, so nothing extra is needed.
 *
 * Passed to the shared core's section rendering by ./render.ts.
 */
export const sectionTextTokens: {
  main: string[];
  soft: string[];
  surface: string[];
} = {
  main: [],
  soft: [],
  surface: [],
};

/**
 * Template tokens the owner's Colors & Appearance choices drive, beyond the
 * standard ones every template has (see @site-core/lib/ownerPalette).
 *
 * `secondary` is this template's soft-surface stack: the first entry is the
 * surface the owner's secondary colour stands for, and the rest keep their
 * lightness offset from it. `primary` and `accent` are the template's own
 * tokens that play those roles.
 */
export const ownerColorTokens: {
  primary: string[];
  secondary: string[];
  accent: string[];
} = {
  primary: [],
  secondary: ["--muted"],
  accent: [],
};
