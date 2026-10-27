import coreUsePage from "@site-core/lib/usePage";
import { renderSections as coreRenderSections } from "@site-core/lib/renderSections";
import { sectionTextTokens } from "./theme";

/**
 * The shared core's section rendering, bound to this template's section theme
 * (theme.ts) — the core is shared by every template and can't import it.
 * Pages import renderSections / usePage from here.
 */

export * from "@site-core/lib/renderSections";

export const renderSections = (
  props: Omit<Parameters<typeof coreRenderSections>[0], "theme">,
) => coreRenderSections({ ...props, theme: sectionTextTokens });

const usePage = (
  slug: Parameters<typeof coreUsePage>[0],
  sectionComponents?: Parameters<typeof coreUsePage>[1],
) => coreUsePage(slug, sectionComponents, sectionTextTokens);

export default usePage;
