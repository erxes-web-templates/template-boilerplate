import React from "react";
import type { Section } from "../types/sections";

type KnownSectionType =
  | "hero"
  | "imageText"
  | "form"
  | "youtube"
  | "tours"
  | "cmsPosts"
  | "gallery"
  | "contact"
  | "text"
  | "products"
  | "productCategories"
  | "carousel"
  | "lastViewedProducts"
  | "banner"
  | "bookingForm"
  | "booking-form"
  | "rooms"
  | "content"
  | "stats"
  | "features"
  | "faq"
  | "testimonials"
  | "howItWorks"
  | "requestCategories"
  | "requestForm"
  | "trackRequest";

interface RenderSectionsProps {
  sections: Section[];
  components: {
    [key in KnownSectionType]?: React.ComponentType<{ section: Section }>;
  };
}

/**
 * Hex to the bare `h s% l%` channels Tailwind's tokens expect.
 *
 * `--foreground` and friends are consumed as `hsl(var(--foreground))`, so a
 * hex value cannot be assigned to them directly — `hsl(#ffffff)` is not a
 * colour. Returns null on anything unparseable so a bad value falls back to
 * the theme rather than blanking the text.
 */
const hexToHslChannels = (hex?: string | null): string | null => {
  if (!hex) return null;
  const value = hex.trim().replace("#", "");
  const full =
    value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  if (full.length !== 6 || /[^0-9a-f]/i.test(full)) return null;

  const [r, g, b] = [0, 2, 4].map(
    (i) => parseInt(full.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(
    lightness * 100,
  )}%`;
};

/**
 * Secondary text, derived from the chosen colour rather than left at the theme
 * default. `text-muted-foreground` is the most used utility in these sections
 * by a wide margin, so overriding only `--foreground` would leave most of the
 * copy unchanged and look like the setting had not applied.
 */
const mutedFrom = (channels: string): string => {
  const [hue, saturation, lightness] = channels.split(" ");
  const value = parseFloat(lightness);
  const shifted = value > 50 ? value - 22 : value + 22;
  return `${hue} ${saturation} ${Math.round(Math.min(100, Math.max(0, shifted)))}%`;
};

/**
 * Per-section background and text colour, set in the builder.
 *
 * Shared by both render paths. Sections reach the page two ways — this module
 * for the server-rendered routes, and `usePage` for the client shell the
 * builder preview uses — so styling applied in only one of them shows up on
 * the live site but not in the preview, which is exactly the kind of
 * difference the preview exists to rule out.
 *
 * Text colour is applied by overriding the theme tokens rather than by setting
 * `color`: the sections carry explicit `text-foreground` /
 * `text-muted-foreground` classes throughout, and those would win over an
 * inherited colour on the wrapper. Overriding the variables they read reaches
 * all of them. `--primary` is deliberately left alone so accents, links and
 * buttons keep the brand colour.
 *
 * The caller puts this on a wrapper rather than on the section: sections own
 * their vertical padding, and colouring the element that owns that padding is
 * what makes the band reach full width with no seam between neighbours.
 */
export const sectionSurfaceStyle = (
  section: Section,
): React.CSSProperties | undefined => {
  const background = section?.config?.backgroundColor;
  const text = hexToHslChannels(section?.config?.textColor);

  if (!background && !text) return undefined;

  return {
    ...(background ? { backgroundColor: background } : {}),
    ...(text
      ? ({
          "--foreground": text,
          "--muted-foreground": mutedFrom(text),
        } as React.CSSProperties)
      : {}),
  };
};

/**
 * A card's surface, derived from the section behind it.
 *
 * Cards are not given their own colour to configure. One colour per section is
 * enough: a card only has to read as *slightly* lifted off its background, and
 * asking someone to pick a second colour that is a few percent different from
 * the first invites mismatched pairs for no gain.
 *
 * The lift is by lightness, in the direction that reads as raised. On a dark
 * section the card lightens — the convention every dark UI uses, because a
 * shadow is invisible against near-black. On a light section it lifts a little
 * too, and when the background is already near-white the card stays put and
 * the existing border carries the separation instead.
 */
const liftedFrom = (channels: string): string => {
  const [hue, saturation, lightness] = channels.split(" ");
  const value = parseFloat(lightness);
  const lifted = value < 50 ? value + 7 : Math.min(value + 3, 100);
  return `${hue} ${saturation} ${Math.round(lifted)}%`;
};

/** Dark or light text for a surface, judged on its lightness channel. */
const readableForChannels = (channels: string): string => {
  const lightness = parseFloat(channels.split(" ")[2]);
  return lightness > 55 ? "240 10% 4%" : "0 0% 98%";
};

/**
 * The surface style for a card *inside* a section.
 *
 * Cards sit on their own background, so they cannot simply inherit the
 * section's: a dark section left white cards with white text on them,
 * invisible. This derives the card from the section background and re-scopes
 * the foreground tokens so text on the card stays readable.
 *
 * Returns a style whenever either colour is configured — a background needs
 * deriving from, and a text colour alone still needs correcting for, since the
 * card underneath it is still the theme's white.
 */
export const cardSurfaceStyle = (
  section: Section,
): React.CSSProperties | undefined => {
  const background = hexToHslChannels(section?.config?.backgroundColor);
  const text = hexToHslChannels(section?.config?.textColor);

  if (!background && !text) return undefined;

  // With no section background the card is still the theme's white, so text
  // has to be readable against that rather than against the section.
  const card = background ? liftedFrom(background) : null;
  const foreground =
    text ?? readableForChannels(card ?? "0 0% 100%");

  return {
    ...(card ? { backgroundColor: `hsl(${card})` } : {}),
    ...({
      "--foreground": foreground,
      "--card-foreground": foreground,
      "--muted-foreground": mutedFrom(foreground),
    } as React.CSSProperties),
  };
};

export function renderSections({ sections, components }: RenderSectionsProps) {
  if (!sections || !Array.isArray(sections)) {
    console.warn("Invalid or missing sections array");
    return null;
  }

  return sections.map((section, index) => {
    if (!section || typeof section !== "object" || !section.type) {
      console.warn(`Invalid section at index ${index}`);
      return null;
    }

    const Component = components[section.type as KnownSectionType];

    if (!Component) {
      console.warn(`No component found for section type: ${section.type}`);
      return null;
    }

    const surface = sectionSurfaceStyle(section);

    if (surface) {
      return (
        <div key={index} style={surface}>
          <Component section={section} />
        </div>
      );
    }

    return <Component key={index} section={section} />;
  });
}
