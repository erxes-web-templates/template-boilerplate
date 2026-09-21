import { Quote } from "lucide-react";
import { Section } from "../../../types/sections";
import { CARD, SectionHeading, SectionShell } from "./_SectionHeading";

type Testimonial = {
  quote?: string;
  author?: string;
  role?: string;
  location?: string;
};

/**
 * Quotes from guests or customers.
 *
 * The attribution line is assembled from whichever of role and location are
 * filled in, so a half-filled entry does not render a stray separator.
 */
const TestimonialsSection = ({ section }: { section: Section }) => {
  const items: Testimonial[] = section.config?.items ?? [];
  const shown = items.filter((item) => item.quote);

  if (shown.length === 0) return null;

  return (
    <SectionShell muted>
      <SectionHeading
        eyebrow={section.config?.eyebrow}
        eyebrowIcon={section.config?.eyebrowIcon}
        title={section.config?.title}
        description={section.config?.description}
      />

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((item, index) => {
          const attribution = [item.role, item.location]
            .filter(Boolean)
            .join(" · ");

          return (
            <figure
              key={`${item.author}-${index}`}
              className={`${CARD} flex h-full flex-col bg-background p-8`}
            >
              <Quote
                aria-hidden
                className="h-8 w-8 shrink-0 text-primary/25"
              />
              <blockquote className="mt-5 flex-1 text-base leading-relaxed text-foreground">
                {item.quote}
              </blockquote>
              {(item.author || attribution) && (
                <figcaption className="mt-6 border-t border-border pt-5">
                  {item.author && (
                    <span className="block text-sm font-semibold text-foreground">
                      {item.author}
                    </span>
                  )}
                  {attribution && (
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {attribution}
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </SectionShell>
  );
};

export default TestimonialsSection;
