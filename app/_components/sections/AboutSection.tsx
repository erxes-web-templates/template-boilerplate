import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import { Section } from "../../../types/sections";
import { getFileUrl, templateUrl } from "@/lib/utils";
import { toHtml } from "../../../lib/html";
import { isBuildMode } from "../../../lib/buildMode";
import Link from "next/link";
import { MEDIA, SectionShell } from "./_SectionHeading";

const AboutSection = ({ section }: { section: Section }) => {
  const isImageLeft = section.config.imagePosition === "left";
  const isBuilder = isBuildMode();
  const ctaHref = section.config.primaryCtaUrl
    ? isBuilder
      ? templateUrl(section.config.primaryCtaUrl)
      : section.config.primaryCtaUrl
    : "#";

  const imageEl = section.config.image ? (
    <div className="w-full lg:w-1/2">
      <div className={`${MEDIA} relative aspect-[4/3] w-full shadow-sm`}>
        <Image
          src={
            getFileUrl(section.config.image.url) || section.config.image.initUrl
          }
          alt={section.config.title || ""}
          fill
          className="object-cover"
        />
      </div>
    </div>
  ) : null;

  return (
    <SectionShell>
      <div className="flex flex-wrap items-center gap-10 lg:flex-nowrap lg:gap-16">
        {isImageLeft && imageEl}

        <div className="w-full lg:flex-1">
          {section.config.eyebrow && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {section.config.eyebrow}
            </span>
          )}
          {section.config.title && (
            <h2
              className={`font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl ${
                section.config.eyebrow ? "mt-5" : ""
              }`}
            >
              {section.config.title}
            </h2>
          )}
          {section.config.description && (
            <div
              className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg"
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

        {!isImageLeft && imageEl}
      </div>
    </SectionShell>
  );
};

export default AboutSection;
