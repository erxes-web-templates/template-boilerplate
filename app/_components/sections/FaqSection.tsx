"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "../../../types/sections";
import { SectionHeading, SectionShell } from "./_SectionHeading";

type Faq = { question?: string; answer?: string };

/**
 * Questions and answers.
 *
 * `collapsible` on a single-open accordion matters: without it the first item
 * can be opened but never closed again, which reads as a broken control.
 */
const FaqSection = ({ section }: { section: Section }) => {
  const items: Faq[] = section.config?.items ?? [];
  const shown = items.filter((item) => item.question);

  if (shown.length === 0) return null;

  return (
    <SectionShell>
      <SectionHeading
        eyebrow={section.config?.eyebrow}
        eyebrowIcon={section.config?.eyebrowIcon}
        title={section.config?.title}
        description={section.config?.description}
      />

      <Accordion
        type="single"
        collapsible
        className="mx-auto mt-12 max-w-3xl space-y-3"
      >
        {shown.map((item, index) => (
          <AccordionItem
            key={`${item.question}-${index}`}
            value={`faq-${index}`}
            className="rounded-2xl border border-border bg-card px-6 data-[state=open]:shadow-sm"
          >
            <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
};

export default FaqSection;
