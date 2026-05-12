"use client";

import { Section } from "../types/sections";
import { GET_WEB_PAGE } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { Suspense } from "react";
import CircleLoader from "@/components/common/CircleLoader";
import EmptyState from "@/components/common/EmptyState";

type SectionComponents = Record<string, React.ComponentType<{ section: Section }>>;

const EMPTY_SLUGS = ["home", "about", "contact", "confirmation"];

const usePage = (slug: string | null, sectionComponents: SectionComponents = {}) => {
  const params = useParams<{ id: string }>();
  const { data: pageData, loading } = useQuery(GET_WEB_PAGE, {
    variables: {
      slug,
      webId: params.id,
    },
    fetchPolicy:
      process.env.NEXT_PUBLIC_BUILD_MODE === "build"
        ? "network-only"
        : "cache-first",
    context: {
      headers: {
        "client-portal-id": params.id,
      },
    },
  });

  const sections = pageData?.cpWebPage?.pageItems || [];

  const renderSection = (section: Section) => {
    const Component = sectionComponents[section.type];
    return Component ? <Component section={section} /> : null;
  };

  const PageContent = () => {
    if (!sections || (sections.length === 0 && slug && EMPTY_SLUGS.includes(slug))) {
      return <EmptyState title="No contents available" />;
    }
    if (loading) {
      return <div><CircleLoader /></div>;
    }
    return (
      <Suspense fallback={<CircleLoader />}>
        {sections.length > 0 &&
          sections.map((section: Section, index: number) => (
            <div key={index}>{renderSection(section)}</div>
          ))}
      </Suspense>
    );
  };

  return PageContent;
};

export default usePage;
