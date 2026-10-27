"use client";

import React, { createContext, useContext } from "react";

/**
 * Interface text the site's owner can change: button labels, form labels,
 * footer headings, empty and error messages, screen-reader labels.
 *
 * Templates used to write these straight into the JSX, so nobody could edit
 * or translate them — a Mongolian site still said "Book now" and "Unable to
 * load rooms". Each template lists them, with its English defaults, in its
 * app/_components/siteText.ts and binds them with createSiteText(); the
 * owner's replacements come from the site config (`texts`) and are edited in
 * the builder's Site text panel.
 *
 * Section copy that belongs to one section instance (a heading, a caption)
 * stays in that section's config instead — this is for text shared by every
 * page, or fixed by the template's design.
 */

export type SiteTextEntry = {
  /** Where it appears, grouping the builder panel: "Header", "Contact section"… */
  group: string;
  /** What the owner is editing, in plain words. */
  label: string;
  /** The template's own wording, used until the owner changes it. */
  default: string;
  /**
   * The owner may switch this text off entirely. For claims about the
   * business — "Free shipping", "30-day returns" — that a site which doesn't
   * offer them must be able to remove, not just reword. A component showing a
   * hideable text must render nothing when `t()` returns "".
   */
  hideable?: boolean;
};

/** Stored as the owner's value to mean "don't show this" (hideable only). */
export const SITE_TEXT_HIDDEN = "__hidden__";

const SiteTextContext = createContext<Record<string, string> | null>(null);

/**
 * Binds a template's catalog. This package is shared by every template, so the
 * catalog is passed in rather than imported:
 *
 *   export const { SiteTextProvider, useSiteText } = createSiteText(siteText);
 *
 * SiteTextProvider goes in ClientShell (live site) and ClientLayout (builder)
 * with the site config's `texts`. useSiteText() returns `t(key)` — the owner's
 * wording, or the template's default. An empty replacement counts as unset,
 * so clearing a field restores the default rather than blanking the text;
 * only a hideable entry the owner switched off comes back as "".
 */
export function createSiteText<Catalog extends Record<string, SiteTextEntry>>(
  catalog: Catalog,
) {
  function SiteTextProvider({
    texts,
    children,
  }: {
    texts?: Record<string, string> | null;
    children: React.ReactNode;
  }) {
    return (
      <SiteTextContext.Provider value={texts ?? null}>
        {children}
      </SiteTextContext.Provider>
    );
  }

  function useSiteText() {
    const texts = useContext(SiteTextContext);
    return (key: keyof Catalog & string): string => {
      const entry = catalog[key];
      const own = texts?.[key];
      if (own === SITE_TEXT_HIDDEN && entry.hideable) return "";
      return typeof own === "string" && own.trim() && own !== SITE_TEXT_HIDDEN
        ? own
        : entry.default;
    };
  }

  return { SiteTextProvider, useSiteText };
}
