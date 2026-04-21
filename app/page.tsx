import { renderSections } from "../lib/renderSections";
import { fetchWebPage } from "../lib/fetchWebPage";
import { Section } from "../types/sections";
import HeroSection from "./_components/sections/HeroSection";
import AboutSection from "./_components/sections/AboutSection";
import FormSection from "./_components/sections/FormSection";
import YoutubeSection from "./_components/sections/YoutubeSection";
import CmsPostsSection from "./_components/sections/CmsPostsSection";
import GallerySection from "./_components/sections/GallerySection";
import ContactSection from "./_components/sections/ContactSection";
import TextSection from "./_components/sections/TextSection";
import ToursSection from "./_components/sections/ToursSection";
import ProductsSection from "./_components/sections/ProductsSection";
import ProductCategoriesSection from "./_components/sections/ProductCategoriesSection";
import CarouselSection from "./_components/sections/CarouselSection";
import LastViewedProductsSection from "./_components/sections/LastViewedProductsSection";
import BannerSection from "./_components/sections/BannerSection";
import BookingFormSection from "./_components/sections/BookingFormSection";

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
  rooms: ProductsSection,
};

// In build mode this is rendered inside the web builder (client-side, live Apollo).
// In production this is a Server Component — Next.js ISR re-generates it
// automatically based on the revalidate interval set in lib/client.ts.
export default async function HomePage() {
  const webId = process.env.ERXES_WEB_ID || "";
  const page = await fetchWebPage(webId, "home");
  const pageItems: Section[] = page?.pageItems ?? [];

  return (
    <div className="home relative overflow-hidden min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background/95 to-muted/30 pointer-events-none" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none animate-pulse [animation-duration:8s]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none animate-pulse [animation-duration:12s] [animation-delay:2s]" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse [animation-duration:10s]" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse [animation-duration:14s] [animation-delay:3s]" />
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
        {renderSections({ sections: pageItems, components: sectionComponents })}
      </div>
    </div>
  );
}
