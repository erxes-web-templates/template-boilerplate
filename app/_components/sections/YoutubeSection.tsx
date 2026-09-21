import React from "react";
import { Section } from "../../../types/sections";
import { MEDIA, SectionHeading, SectionShell } from "./_SectionHeading";

const YoutubeSection = ({ section }: { section: Section }) => {
  if (!section.config?.videoId) return null;

  return (
    <SectionShell muted>
      <SectionHeading
        eyebrow={section.config.eyebrow}
        title={section.config.title}
        description={section.config.description}
        align="center"
      />

      <div
        className={`${MEDIA} mx-auto mt-12 aspect-video max-w-4xl shadow-sm ring-1 ring-border`}
      >
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${section.config.videoId}`}
          title={section.config.title || ""}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </SectionShell>
  );
};

export default YoutubeSection;
