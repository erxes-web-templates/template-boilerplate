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

  return (
    <section className="relative h-[560px] overflow-hidden bg-muted">
      {section.config.image && (
        <Image
          src={
            getFileUrl(section.config.image.url) || section.config.image.initUrl
          }
          alt={section.config.title || ""}
          layout="fill"
          objectFit="cover"
        />
      )}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-3xl mx-auto">
          {section.config.title && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {section.config.title}
            </h1>
          )}
          {section.config.description && (
            <div
              className="text-lg md:text-xl mb-8 text-white/85 leading-relaxed"
              dangerouslySetInnerHTML={toHtml(section.config.description)}
            />
          )}
          {section.config.primaryCtaUrl && (
            <Link href={ctaHref}>
              <Button size="lg" variant="secondary">
                {section.config.primaryCta}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
