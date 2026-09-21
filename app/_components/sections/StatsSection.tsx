import { Section } from "../../../types/sections";
import { SectionHeading, SectionShell } from "./_SectionHeading";

type Stat = { value?: string; label?: string; note?: string };

/**
 * Figures with labels.
 *
 * Renders nothing when nothing is configured. A row of empty tiles reads as a
 * broken page rather than an empty one.
 */
const StatsSection = ({ section }: { section: Section }) => {
  const items: Stat[] = section.config?.items ?? [];
  const shown = items.filter((item) => item.value || item.label);

  if (shown.length === 0) return null;

  return (
    <SectionShell muted>
      <SectionHeading
        eyebrow={section.config?.eyebrow}
        eyebrowIcon={section.config?.eyebrowIcon}
        title={section.config?.title}
        description={section.config?.description}
      />

      <dl className="mt-14 grid grid-cols-2 gap-8 lg:grid-cols-4">
        {shown.map((item, index) => (
          <div key={`${item.label}-${index}`} className="text-center">
            <dt className="font-heading text-4xl font-bold tracking-tight text-primary md:text-5xl">
              {item.value}
            </dt>
            <dd className="mt-3 text-sm font-semibold text-foreground">
              {item.label}
            </dd>
            {item.note && (
              <dd className="mt-1 text-sm text-muted-foreground">
                {item.note}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </SectionShell>
  );
};

export default StatsSection;
