import { Section } from "../../../types/sections";
import { cardSurfaceStyle } from "../../../lib/renderSections";
import {
  CARD,
  SECTION_ICONS,
  SectionHeading,
  SectionShell,
} from "./_SectionHeading";

type Feature = {
  icon?: string;
  tone?: string;
  title?: string;
  description?: string;
};

/**
 * A row of selling points — what the product is, said three or four ways.
 *
 * Distinct from `howItWorks`, which is the same data shape but means a
 * sequence: numbering these would imply an order that is not there.
 *
 * Icons are a fixed set rather than free text. The editor offers exactly these
 * names, so a saved value can always be drawn — a free-text lucide name that
 * did not resolve would render an empty tile with nothing to explain it.
 */

/**
 * Full class strings, never built by concatenation: Tailwind scans source
 * text, so `bg-${tone}-50` would compile to nothing.
 */
const TONES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  neutral: "bg-muted text-foreground",
};

const TONE_CYCLE = ["emerald", "sky", "violet", "amber", "rose"];

/**
 * Columns and width by how many features there are.
 *
 * A fixed four-column grid leaves empty cells on the right when the section
 * holds fewer, which reads as the row having drifted left rather than as a
 * deliberate layout. Narrowing the track to the item count and centring it
 * keeps a two-feature section looking placed instead of truncated.
 */
const GRID_BY_COUNT: Record<number, string> = {
  1: "sm:grid-cols-1 max-w-sm",
  2: "sm:grid-cols-2 max-w-3xl",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const GRID_DEFAULT = "sm:grid-cols-2 lg:grid-cols-3";

const FeaturesSection = ({ section }: { section: Section }) => {
  const items: Feature[] = section.config?.items ?? [];
  const shown = items.filter((item) => item.title || item.description);

  if (shown.length === 0) return null;

  const isCentered = section.config?.align !== "left";

  return (
    <SectionShell>
      <SectionHeading
        eyebrow={section.config?.eyebrow}
        eyebrowIcon={section.config?.badgeIcon}
        title={section.config?.title}
        description={section.config?.description}
        align={isCentered ? "center" : "left"}
      />

      <div
        className={`mt-14 grid grid-cols-1 gap-6 ${
          GRID_BY_COUNT[shown.length] ?? GRID_DEFAULT
        } ${isCentered ? "mx-auto" : ""}`}
      >
        {shown.map((item, index) => {
          const Icon = SECTION_ICONS[item.icon ?? ""];
          const tone =
            TONES[item.tone ?? ""] ??
            TONES[TONE_CYCLE[index % TONE_CYCLE.length]];

          return (
            <div
              key={`${item.title}-${index}`}
              className={`${CARD} p-8 ${isCentered ? "text-center" : ""}`}
              style={cardSurfaceStyle(section)}
            >
              {Icon && (
                <div
                  className={`grid h-14 w-14 place-items-center rounded-2xl ${tone} ${
                    isCentered ? "mx-auto" : ""
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              )}
              {item.title && (
                <h3 className="mt-6 text-lg font-bold text-card-foreground">
                  {item.title}
                </h3>
              )}
              {item.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
};

export default FeaturesSection;
