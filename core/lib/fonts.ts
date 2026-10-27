/**
 * Loads the fonts a site's owner picked in the builder's Colors & Appearance.
 *
 * Picking a font only ever set `--font-body` / `--font-heading` /
 * `--font-mono` on <html>; nothing loaded the font file. A site set to Lora
 * therefore rendered in Lora only for visitors who happened to have it
 * installed, and in the fallback serif for everyone else — on the live site
 * and in the builder preview alike.
 *
 * Call it after those variables are written (ClientShell on the live site,
 * ClientLayout in the builder). It reads them back from <html>, so it works
 * whatever the caller named its locals.
 */

/**
 * The families the builder offers (ColorsAndAppearance's font options), as
 * Google Fonts css2 specs. Anything else — a template's own default, a system
 * stack — is left alone: templates load their own fonts.
 */
const GOOGLE_FONTS: Record<string, string> = {
  Roboto: "Roboto:ital,wght@0,400;0,500;0,700;1,400",
  Lora: "Lora:ital,wght@0,400;0,500;0,600;0,700;1,400",
  Montserrat: "Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400",
  Merriweather: "Merriweather:ital,wght@0,400;0,700;1,400",
  Poppins: "Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400",
  "Fira Code": "Fira+Code:wght@400;500",
  "JetBrains Mono": "JetBrains+Mono:wght@400;500",
  "Source Code Pro": "Source+Code+Pro:wght@400;500",
};

const LINK_ID = "owner-fonts";

/** `'Lora', serif` → `Lora`. */
const firstFamily = (value: string): string =>
  value.split(",")[0].trim().replace(/^["']|["']$/g, "");

export const loadOwnerFonts = (): void => {
  if (typeof document === "undefined") return;

  const root = document.documentElement.style;
  const specs = ["--font-body", "--font-heading", "--font-mono"]
    .map((name) => GOOGLE_FONTS[firstFamily(root.getPropertyValue(name))])
    .filter((spec): spec is string => Boolean(spec))
    .filter((spec, index, all) => all.indexOf(spec) === index);

  const existing = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!specs.length) {
    existing?.remove();
    return;
  }

  const href = `https://fonts.googleapis.com/css2?${specs
    .map((spec) => `family=${spec}`)
    .join("&")}&display=swap`;
  if (existing?.href === href) return;

  const link = existing ?? document.createElement("link");
  link.id = LINK_ID;
  link.rel = "stylesheet";
  link.href = href;
  if (!existing) document.head.appendChild(link);
};
