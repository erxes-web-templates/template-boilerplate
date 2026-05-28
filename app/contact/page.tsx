import type { Metadata } from "next";
import pageData from "../../data/pages/contact.json";
import { renderSections } from "../../lib/renderSections";
import { Section } from "../../types/sections";
import { isBuildMode } from "../../lib/buildMode";
import { fetchWebPage } from "../../lib/fetchWebPage";
import ContactPageClient from "../_client/ContactPage";
import HeroSection from "../_components/sections/HeroSection";
import AboutSection from "../_components/sections/AboutSection";
import FormSection from "../_components/sections/FormSection";
import YoutubeSection from "../_components/sections/YoutubeSection";
import CmsPostsSection from "../_components/sections/CmsPostsSection";
import GallerySection from "../_components/sections/GallerySection";
import ContactSection from "../_components/sections/ContactSection";
import TextSection from "../_components/sections/TextSection";
import ProductsSection from "../_components/sections/ProductsSection";
import ProductCategoriesSection from "../_components/sections/ProductCategoriesSection";
import CarouselSection from "../_components/sections/CarouselSection";
import LastViewedProductsSection from "../_components/sections/LastViewedProductsSection";
import BannerSection from "../_components/sections/BannerSection";
import ToursSection from "../_components/sections/ToursSection";
import BookingFormSection from "../_components/sections/BookingFormSection";

export async function generateMetadata(): Promise<Metadata> {
  if (isBuildMode()) return { title: pageData.title, description: pageData.description };
  const page = await fetchWebPage(process.env.ERXES_WEB_ID || "", "contact");
  return {
    title: page?.name ?? pageData.title,
    description: page?.description ?? pageData.description,
    ...(page?.coverImage && { openGraph: { images: [page.coverImage] } }),
  };
}

export default function ContactPage() {
  if (isBuildMode()) {
    return <ContactPageClient />;
  }

  const sectionComponents = {
    hero: HeroSection,
    imageText: AboutSection,
    form: FormSection,
    tours: ToursSection,
    youtube: YoutubeSection,
    cmsPosts: CmsPostsSection,
    gallery: GallerySection,
    contact: ContactSection,
    text: TextSection,
    products: ProductsSection,
    productCategories: ProductCategoriesSection,
    carousel: CarouselSection,
    lastViewedProducts: LastViewedProductsSection,
    banner: BannerSection,
    bookingForm: BookingFormSection,
    content: TextSection,
  };

  const renderedSections = renderSections({
    sections: pageData.pageItems as unknown as Section[],
    components: sectionComponents,
  });

  return <div className="home">{renderedSections}</div>;
}
