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
  | "booking-form"
  | "rooms"
  | "content"
  | "stats"
  | "features"
  | "faq"
  | "testimonials"
  | "howItWorks"
  | "requestCategories"
  | "requestForm"
  | "trackRequest";

interface RenderSectionsProps {
  sections: Section[];
  components: {
    [key in KnownSectionType]?: React.ComponentType<{ section: Section }>;
  };
}

/**
 * Per-section background, set in the builder.
 *
 * Shared by both render paths. Sections reach the page two ways — this module
 * for the server-rendered routes, and `usePage` for the client shell the
 * builder preview uses — so a background applied in only one of them shows up
 * on the live site but not in the preview, which is exactly the kind of
 * difference the preview exists to rule out.
 *
 * The caller puts this on a wrapper rather than on the section: sections own
 * their vertical padding, and colouring the element that owns that padding is
 * what makes the band reach full width with no seam between neighbours.
 */
export const sectionBackgroundStyle = (
  section: Section,
): React.CSSProperties | undefined => {
  const background = section?.config?.backgroundColor;
  return background ? { backgroundColor: background } : undefined;
};

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

    const background = sectionBackgroundStyle(section);

    if (background) {
      return (
        <div key={index} style={background}>
          <Component section={section} />
        </div>
      );
    }

    return <Component key={index} section={section} />;
  });
}
