import React from "react";
import type { Section } from "../types/sections";

type KnownSectionType =
  | "hero"
  | "imageText"
  | "form"
  | "youtube"
  | "tours"
  | "cmsPosts"
  | "gallery"
  | "contact"
  | "text"
  | "products"
  | "productCategories"
  | "carousel"
  | "lastViewedProducts"
  | "banner"
  | "bookingForm"
  | "rooms"
  | "content";

interface RenderSectionsProps {
  sections: Section[];
  components: {
    [key in KnownSectionType]?: React.ComponentType<{ section: Section }>;
  };
}

export function renderSections({ sections, components }: RenderSectionsProps) {
  if (!sections || !Array.isArray(sections)) {
    console.warn("Invalid or missing sections array");
    return null;
  }

  return sections.map((section, index) => {
    if (!section || typeof section !== "object" || !section.type) {
      console.warn(`Invalid section at index ${index}`);
      return null;
    }

    const Component = components[section.type as KnownSectionType];

    if (!Component) {
      console.warn(`No component found for section type: ${section.type}`);
      return null;
    }

    return <Component key={index} section={section} />;
  });
}
