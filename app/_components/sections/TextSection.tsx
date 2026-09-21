import { Button } from "@/components/ui/button";
import React from "react";
import { Section } from "../../../types/sections";
import { templateUrl } from "@/lib/utils";
import { toHtml } from "../../../lib/html";
import { isBuildMode } from "../../../lib/buildMode";
import Link from "next/link";
import { SectionHeading, SectionShell } from "./_SectionHeading";

const TextSection = ({ section }: { section: Section }) => {
  const isBuilder = isBuildMode();
  const ctaHref = section.config.primaryCtaUrl
    ? isBuilder
      ? templateUrl(section.config.primaryCtaUrl)
      : section.config.primaryCtaUrl
    : "#";

  return (
    <SectionShell>
      <SectionHeading
        eyebrow={section.config.eyebrow}
        title={section.config.title}
        align="center"
      />

      <div className="mx-auto mt-8 max-w-3xl text-center">
        {section.config.description && (
          <div
            className="text-base leading-relaxed text-muted-foreground md:text-lg [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4"
            dangerouslySetInnerHTML={toHtml(section.config.description)}
          />
        )}
        {section.config.primaryCtaUrl && (
          <Link href={ctaHref} className="mt-8 inline-block">
            <Button variant="accent" className="rounded-full px-8">
              {section.config.primaryCta}
            </Button>
          </Link>
        )}
      </div>
    </SectionShell>
  );
};

export default TextSection;
