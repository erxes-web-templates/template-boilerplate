"use client";

import { Section } from "../types/sections";
import { GET_WEB_PAGE } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import React, { Suspense } from "react";
import AboutSection from "../app/_components/sections/AboutSection";
import ToursSection from "../app/_components/sections/ToursSection";
import HeroSection from "../app/_components/sections/HeroSection";
import FormSection from "../app/_components/sections/FormSection";
import TextSection from "../app/_components/sections/TextSection";
import YoutubeSection from "../app/_components/sections/YoutubeSection";
import CmsPostsSection from "../app/_components/sections/CmsPostsSection";
import CircleLoader from "@/components/common/CircleLoader";
import EmptyState from "@/components/common/EmptyState";
import GallerySection from "../app/_components/sections/GallerySection";
import ContactSection from "../app/_components/sections/ContactSection";
import ProductsSection from "../app/_components/sections/ProductsSection";
import ProductCategoriesSection from "../app/_components/sections/ProductCategoriesSection";
import CarouselSection from "../app/_components/sections/CarouselSection";
import LastViewedProductsSection from "../app/_components/sections/LastViewedProductsSection";
import BannerSection from "../app/_components/sections/BannerSection";
import BookingFormSection from "../app/_components/sections/BookingFormSection";
const usePage = (slug: string | null) => {
  const params = useParams<{ id: string }>();
  const { data: pageData, loading } = useQuery(GET_WEB_PAGE, {
    variables: {
      slug: slug,
      webId: params.id,
    },
    // Always fetch from network in build mode so the web builder preview
    // picks up changes immediately after a save mutation runs
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
    switch (section.type) {
      case "imageText":
        return <AboutSection section={section} />;
      case "tours":
        return <ToursSection section={section} />;
      case "hero":
        return <HeroSection section={section} />;
      case "form":
        return <FormSection section={section} />;
      case "youtube":
        return <YoutubeSection section={section} />;
      case "cmsPosts":
        return <CmsPostsSection section={section} />;
      case "gallery":
        return <GallerySection section={section} />;
      case "contact":
        return <ContactSection section={section} />;
      case "text":
        return <TextSection section={section} />;
      case "products":
        return <ProductsSection section={section} />;
      case "productCategories":
        return <ProductCategoriesSection section={section} />;
      case "carousel":
        return <CarouselSection section={section} />;
      case "lastViewedProducts":
        return <LastViewedProductsSection section={section} />;
      case "banner":
        return <BannerSection section={section} />;
      case "booking-form":
        return <BookingFormSection section={section} />;
      default:
        return null;
    }
  };

  const PageContent = () => {
    if (
      !sections ||
      (sections.length === 0 && slug === "home") ||
      (sections.length === 0 && slug === "about")
    ) {
      return <EmptyState title="No contents available" />;
    }
    if (loading) {
      return (
        <div>
          <CircleLoader />
        </div>
      );
    }
    return (
      <Suspense fallback={<CircleLoader />}>
        {sections &&
          sections.length > 0 &&
          sections.map((section: Section, index: number) => (
            <div key={index}>{renderSection(section)}</div>
          ))}
      </Suspense>
    );
  };

  return PageContent;
};

export default usePage;
