import { Section } from "../../../types/sections";
import { SectionHeading, SectionShell } from "./_SectionHeading";

type Step = { title?: string; description?: string };

/**
 * A numbered process — what happens, in order.
 *
 * Numbered rather than iconned: the order is the information here, and an icon
 * per step would be decoration competing with it. The connecting rule is drawn
 * behind the numerals on wide screens so the sequence reads as a track.
 */
const HowItWorksSection = ({ section }: { section: Section }) => {
  const steps: Step[] = section.config?.steps ?? [];
  const shown = steps.filter((step) => step.title || step.description);

  if (shown.length === 0) return null;

  return (
    <SectionShell>
      <SectionHeading
        eyebrow={section.config?.eyebrow}
        eyebrowIcon={section.config?.eyebrowIcon}
        title={section.config?.title}
        description={section.config?.description}
      />

      <ol className="relative mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden border-t border-dashed border-border lg:block"
        />
        {shown.map((step, index) => (
          <li key={`${step.title}-${index}`} className="relative">
            <span className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background font-heading text-base font-bold text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            {step.title && (
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {step.title}
              </h3>
            )}
            {step.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            )}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
};

export default HowItWorksSection;
