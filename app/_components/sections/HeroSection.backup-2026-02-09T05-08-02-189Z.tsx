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
    <section className="relative h-[600px]">
      {section.config.image && (
        <Image
          src={
            getFileUrl(section.config.image.url) || section.config.image.initUrl
          }
          alt="Beautiful landscape"
          layout="fill"
          objectFit="cover"
        />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">{section.config.title}</h1>
          <p
            className="text-xl mb-8"
            dangerouslySetInnerHTML={toHtml(section.config.description)}
          ></p>
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
