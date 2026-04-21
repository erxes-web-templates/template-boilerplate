import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import { Section } from "../../../types/sections";
import { getFileUrl } from "@/lib/utils";
import { toHtml } from "../../../lib/html";
import Link from "next/link";

const AboutSection = ({ section }: { section: Section }) => {
  const isImageLeft = section.config.imagePosition === "left";
  const ctaHref = section.config.primaryCtaUrl ?? "#";

  const imageEl = section.config.image ? (
    <div className="w-full md:w-1/2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={getFileUrl(section.config.image.url) || section.config.image.initUrl}
          alt={section.config.title || ""}
          fill
          className="object-cover"
        />
      </div>
    </div>
  ) : null;

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {section.config.title && (
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-10">
            {section.config.title}
          </h2>
        )}
        <div className="flex flex-wrap items-center gap-8">
          {isImageLeft && imageEl}
          <div className="w-full md:flex-1">
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
          {!isImageLeft && imageEl}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
