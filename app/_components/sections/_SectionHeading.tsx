import {
  Award,
  CheckCircle2,
  Clock,
  Heart,
  Leaf,
  Package,
  Shield,
  Sparkles,
  Star,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Shared layout primitives for every section.
 *
 * Sections used to each pick their own padding, container width and heading
 * type scale, so stacking two of them produced uneven rhythm and three
 * different heading sizes. These exist so the page reads as one design rather
 * than as a pile of independently styled blocks.
 *
 * Colour comes only from theme tokens — `bg-background`, `text-foreground`,
 * `text-primary`, `border-border`. That is what lets the same markup re-skin
 * per client: ClientShell writes the API's appearance values onto those CSS
 * variables at runtime.
 */

/** The icon set shared by the pill eyebrow and the features grid. */
export const SECTION_ICONS: Record<string, LucideIcon> = {
  leaf: Leaf,
  check: CheckCircle2,
  shield: Shield,
  award: Award,
  star: Star,
  heart: Heart,
  sparkles: Sparkles,
  truck: Truck,
  clock: Clock,
  users: Users,
  package: Package,
};

/**
 * Vertical rhythm. One scale, so neighbouring sections never disagree about
 * how much air a band deserves.
 */
export const SECTION_PADDING = "py-20 md:py-28";

/** Horizontal container. `md:px-6` keeps text off the edge on tablets. */
export const SECTION_CONTAINER = "container mx-auto max-w-6xl px-4 md:px-6";

/** Card surface, used by every grid of cards so they age together. */
export const CARD =
  "rounded-2xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-md";

/** Media surface — images and embeds share one corner radius. */
export const MEDIA = "overflow-hidden rounded-2xl bg-muted";

export function SectionShell({
  children,
  muted = false,
  className = "",
  id,
}: {
  children: React.ReactNode;
  /** Tints the band, for alternating rhythm down a long page. */
  muted?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`${SECTION_PADDING} ${muted ? "bg-muted/30" : ""} ${className}`}
    >
      <div className={SECTION_CONTAINER}>{children}</div>
    </section>
  );
}

/**
 * The eyebrow / title / description block.
 *
 * The eyebrow renders as a pill rather than plain uppercase text: it reads as a
 * deliberate label instead of a stray line of small caps, and it gives the
 * heading something to sit under.
 */
export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  eyebrowIcon?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  if (!eyebrow && !title && !description) return null;

  const isCentered = align === "center";
  const Icon = SECTION_ICONS[eyebrowIcon ?? ""];

  return (
    <div
      className={`${isCentered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          {Icon && <Icon className="h-4 w-4" />}
          {eyebrow}
        </span>
      )}
      {title && (
        <h2
          className={`font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl ${
            eyebrow ? "mt-5" : ""
          }`}
        >
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
