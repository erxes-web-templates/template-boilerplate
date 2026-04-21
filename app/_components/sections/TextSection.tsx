import { Button } from "@/components/ui/button";
import React from "react";
import { Section } from "../../../types/sections";
import { toHtml } from "../../../lib/html";
import Link from "next/link";

const TextSection = ({ section }: { section: Section }) => {
  const ctaHref = section.config.primaryCtaUrl ?? "#";
  return (
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {section.config.title && (
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-6">
            {section.config.title}
          </h2>
        )}
        <div className="max-w-3xl">
          {section.config.description && (
            <div
              className="text-sm text-muted-foreground leading-relaxed mb-6"
              dangerouslySetInnerHTML={toHtml(section.config.description)}
            />
          )}
          {section.config.primaryCtaUrl && (
            <Link href={ctaHref}>
              <Button>{section.config.primaryCta}</Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default TextSection;
