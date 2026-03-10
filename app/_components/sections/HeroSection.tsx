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
    <section className="relative h-[600px] overflow-hidden">
      {section.config.image && (
        <Image
          src={
            getFileUrl(section.config.image.url) || section.config.image.initUrl
          }
          alt="Beautiful landscape"
          layout="fill"
          objectFit="cover"
          className="scale-105 animate-in zoom-in-105 duration-1000"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="text-center text-white relative z-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-2xl">
            {section.config.title}
          </h1>
          <p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500"
            dangerouslySetInnerHTML={toHtml(section.config.description)}
          ></p>
          {section.config.primaryCtaUrl && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
              <Link href={ctaHref}>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="shadow-2xl hover:scale-105 transition-transform duration-300 hover:shadow-white/20"
                >
                  {section.config.primaryCta}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;