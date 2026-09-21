"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Section } from "../../../types/sections";
import { getTicketConfig } from "../../../lib/ticketConfig";
import { useTicketTags } from "../../../hooks/useTickets";
import { SectionHeading } from "./_SectionHeading";

type ConfiguredCategory = { name?: string; description?: string };

/**
 * What people can report.
 *
 * Categories come from erxes tags so the list cannot drift from what the admin
 * actually offers; the configured list is only a fallback for when no tags of
 * that type exist. With neither, the section renders nothing rather than a
 * grid of empty tiles.
 *
 * The link points at the request form on the same page by default, because
 * this template carries the form as a section rather than on a /submit route.
 */
const RequestCategoriesSection = ({ section }: { section: Section }) => {
  const config = useMemo(
    () => getTicketConfig(section.config),
    [section.config],
  );
  const { tags, loading } = useTicketTags(config.tagType);

  const fallback: ConfiguredCategory[] = section.config?.categories ?? [];
  const href = section.config?.ctaUrl ?? "#request-form";

  const items: ConfiguredCategory[] = tags.length
    ? tags.map((tag) => ({ name: tag.name ?? "" })).filter((tag) => tag.name)
    : fallback.filter((item) => item.name);

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <SectionHeading
          eyebrow={section.config?.eyebrow}
          title={section.config?.title ?? section.content}
          description={section.config?.description}
        />

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={`${item.name}-${index}`}>
              <Link
                href={href}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <span className="text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 text-base font-semibold text-card-foreground">
                  {item.name}
                </span>
                {item.description && (
                  <span className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default RequestCategoriesSection;
