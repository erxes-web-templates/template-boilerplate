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
    <section
      className="relative h-[600px]"
      style={{ backgroundColor: "var(--background)" }}
    >
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
      <div className="absolute inset-0 flex items-center justify-center bg-black/55">
        <div
          className="text-center"
          style={{ color: "var(--primary)", fontFamily: "var(--font-body)" }}
        >
          <h1
            className="mb-4 text-5xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {section.config.title}
          </h1>
          <p
            className="mb-8 text-xl"
            dangerouslySetInnerHTML={toHtml(section.config.description)}
          ></p>
          {section.config.primaryCtaUrl && (
            <Link href={ctaHref}>
              <Button
                size="lg"
                className="rounded-full px-8"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--background)",
                }}
              >
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
