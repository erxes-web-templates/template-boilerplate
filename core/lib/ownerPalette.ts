/**
 * Gives the colours a site's owner picks in Colors & Appearance a job.
 *
 * Every template wrote the owner's choices to `--primary`, `--background`,
 * `--secondary-color` and `--accent`, but only primary and background did much:
 * nothing read `--secondary-color` at all, and each template kept its own
 * accent-like colour (Nocturne's brass, Zah's lacquer) that ignored `--accent`.
 * This maps them onto the template's tokens, with one meaning everywhere:
 *
 *  - Primary    — buttons, links and key actions. Text on them stays readable.
 *  - Secondary  — soft surfaces: panels, cards, alternate bands. The template's
 *                 own surface stack is re-tinted, keeping its light/dark steps.
 *  - Accent     — small highlights: icons, labels, badges, hover states, plus
 *                 the template's own accent colours.
 *  - Background — the page itself.
 *
 * Call it after the owner's values are written to <html> (ClientShell on the
 * live site, ClientLayout in the builder, and the Colors & Appearance panel
 * while editing). It reads them back from there, so it does not care what the
 * caller named its locals. Unset values leave the template's design untouched.
 *
 * Which tokens each colour drives is per template: the template passes its
 * own (its sections/theme.ts) because this package is shared by every
 * template and cannot import any one of them.
 */

/** The template's own tokens that play each role (see the template's theme.ts). */
export type OwnerColorTokens = {
  primary: string[];
  secondary: string[];
  accent: string[];
};

type Rgb = [number, number, number];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const CHANNELS = /^(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%$/;

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) =>
    light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255)) as Rgb;
};

const rgbToHsl = ([r, g, b]: Rgb): [number, number, number] => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l * 100];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h =
    max === rn ? ((gn - bn) / d) % 6 : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s * 100, l * 100];
};

/** A colour as written in a token: `#3f4a3c` or bare `h s% l%` channels. */
const parse = (value: string): Rgb | null => {
  const v = value.trim();
  if (HEX.test(v)) {
    const hex = v.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
  }
  const m = CHANNELS.exec(v);
  return m ? hslToRgb(+m[1], +m[2], +m[3]) : null;
};

const toHex = (rgb: Rgb) =>
  `#${rgb.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;

const toChannels = (rgb: Rgb) => {
  const [h, s, l] = rgbToHsl(rgb);
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
};

/**
 * In the same form as the token it replaces. Templates disagree — most keep
 * `--primary` as a hex, ecommerce-modern as channels — and writing a hex into
 * a token read as `hsl(var(--primary))` produced no colour at all.
 */
const formatLike = (original: string, rgb: Rgb) =>
  CHANNELS.test(original.trim()) ? toChannels(rgb) : toHex(rgb);

const luminance = ([r, g, b]: Rgb) => {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The template's own value for a token: what it is without our inline override. */
const original = (el: HTMLElement, name: string): string => {
  const inline = el.style.getPropertyValue(name);
  if (inline) el.style.removeProperty(name);
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  if (inline) el.style.setProperty(name, inline);
  return value;
};

const reset = (el: HTMLElement, names: string[]) =>
  names.forEach((name) => el.style.removeProperty(name));

/**
 * Text on a colour the owner picked: the template's own foreground when it
 * still reads (WCAG AA, 4.5:1), otherwise whichever of near-black or white
 * reads better. A pale primary used to leave white button labels on it.
 */
const setForeground = (el: HTMLElement, name: string, surface: Rgb) => {
  el.style.removeProperty(name);
  const own = original(el, name);
  const ownRgb = own ? parse(own) : null;
  if (ownRgb && contrast(ownRgb, surface) >= 4.5) return;
  const dark: Rgb = [17, 17, 17];
  const light: Rgb = [255, 255, 255];
  const best = contrast(dark, surface) >= contrast(light, surface) ? dark : light;
  el.style.setProperty(name, formatLike(own || "#000", best));
};

/**
 * Re-tints a stack of surfaces in the owner's colour. The first token is the
 * one the colour stands for; the others keep their lightness offset from it,
 * so a template's light/dark surface steps survive the change of hue.
 */
const tintStack = (el: HTMLElement, names: string[], colour: Rgb) => {
  reset(el, names);
  const originals = names.map((name) => original(el, name));
  const base = parse(originals[0] ?? "");
  if (!base) return;
  const [, , baseL] = rgbToHsl(base);
  const [h, s, l] = rgbToHsl(colour);

  names.forEach((name, i) => {
    const rgb = parse(originals[i]);
    if (!rgb) return;
    const offset = rgbToHsl(rgb)[2] - baseL;
    const shifted = hslToRgb(h, s, Math.max(0, Math.min(100, l + offset)));
    el.style.setProperty(name, formatLike(originals[i], shifted));
  });
};

const setAll = (el: HTMLElement, names: string[], colour: Rgb) => {
  reset(el, names);
  names.forEach((name) => {
    el.style.setProperty(name, formatLike(original(el, name), colour));
  });
};

/** Inline owner value on <html>, normalised to the template's own format. */
const ownerColour = (root: HTMLElement, name: string): Rgb | null => {
  const value = root.style.getPropertyValue(name);
  const rgb = value ? parse(value) : null;
  if (rgb) root.style.setProperty(name, formatLike(original(root, name), rgb));
  return rgb;
};

export const applyOwnerPalette = (
  ownerColorTokens: OwnerColorTokens = { primary: [], secondary: [], accent: [] },
): void => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  // In the builder a template's tokens are scoped to its preview wrapper (see
  // the builder's tailwind.template-themes.ts); on the live site, to :root.
  const scope =
    document.querySelector<HTMLElement>("[data-template]") ?? root;

  const primary = ownerColour(root, "--primary");
  const secondary = ownerColour(root, "--secondary-color");
  const accent = ownerColour(root, "--accent");

  const { primary: primaryTokens, secondary: secondaryTokens, accent: accentTokens } =
    ownerColorTokens;

  if (primary) {
    setAll(scope, primaryTokens, primary);
    setForeground(scope, "--primary-foreground", primary);
  } else {
    reset(scope, [...primaryTokens, "--primary-foreground"]);
  }

  if (secondary) {
    tintStack(scope, secondaryTokens, secondary);
    setAll(scope, ["--secondary"], secondary);
    setForeground(scope, "--secondary-foreground", secondary);
  } else {
    reset(scope, [...secondaryTokens, "--secondary", "--secondary-foreground"]);
  }

  if (accent) {
    setAll(scope, accentTokens, accent);
    setForeground(scope, "--accent-foreground", accent);
  } else {
    reset(scope, [...accentTokens, "--accent-foreground"]);
  }
};
