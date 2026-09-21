import React from "react";
import { Section } from "../../../types/sections";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { getFileUrl, templateUrl } from "@/lib/utils";
import { toHtml } from "../../../lib/html";
import { isBuildMode } from "../../../lib/buildMode";

const HeroSection = ({ section }: { section: Section }) => {
  const isBuilder = isBuildMode();
  const ctaHref = section.config.primaryCtaUrl
    ? isBuilder
      ? templateUrl(section.config.primaryCtaUrl)
      : section.config.primaryCtaUrl
    : "#";

  const hasImage = Boolean(section.config.image);

  return (
    <section className="relative isolate flex min-h-[600px] items-center overflow-hidden">
      {hasImage && (
        <>
          <Image
            src={
              getFileUrl(section.config.image.url) ||
              section.config.image.initUrl
            }
            alt={section.config.title || ""}
            fill
            priority
            className="object-cover"
          />
          {/* A gradient rather than a flat scrim: the copy sits low, so the
              darkening should too, leaving the top of the photograph intact. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
        </>
      )}

      <div
        className={`relative ${
          hasImage ? "text-white" : "text-foreground"
        } container mx-auto max-w-6xl px-4 py-24 md:px-6`}
      >
        <div className="max-w-2xl">
          {section.config.eyebrow && (
            <span
              className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm ${
                hasImage
                  ? "bg-white/15 text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {section.config.eyebrow}
            </span>
          )}

          {section.config.title && (
            <h1
              className={`font-heading text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl ${
                section.config.eyebrow ? "mt-6" : ""
              }`}
            >
              {section.config.title}
            </h1>
          )}

          {section.config.subtitle && (
            <p
              className={`mt-4 text-lg font-medium ${
                hasImage ? "text-white/80" : "text-muted-foreground"
              }`}
            >
              {section.config.subtitle}
            </p>
          )}

          {section.config.description && (
            <div
              className={`mt-5 text-base leading-relaxed md:text-lg ${
                hasImage ? "text-white/75" : "text-muted-foreground"
              }`}
              dangerouslySetInnerHTML={toHtml(section.config.description)}
            />
          )}

          {section.config.primaryCtaUrl && (
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={ctaHref}>
                <Button size="lg" variant="accent" className="rounded-full px-8">
                  {section.config.primaryCta}
                </Button>
              </Link>
            </div>
          )}

          {Array.isArray(section.config.commitments) &&
            section.config.commitments.length > 0 && (
              <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
                {section.config.commitments
                  .filter((item: any) => item?.value || item?.label)
                  .map((item: any, index: number) => (
                    <div key={`${item.label}-${index}`}>
                      <dt className="font-heading text-2xl font-bold">
                        {item.value}
                      </dt>
                      <dd
                        className={`mt-1 text-sm ${
                          hasImage ? "text-white/70" : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </dd>
                    </div>
                  ))}
              </dl>
            )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
