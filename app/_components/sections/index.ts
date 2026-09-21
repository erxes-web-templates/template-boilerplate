import AboutSection from "./AboutSection";
import BannerSection from "./BannerSection";
import BookingFormSection from "./BookingFormSection";
import CarouselSection from "./CarouselSection";
import CmsPostsSection from "./CmsPostsSection";
import ContactSection from "./ContactSection";
import FormSection from "./FormSection";
import GallerySection from "./GallerySection";
import HeroSection from "./HeroSection";
import LastViewedProductsSection from "./LastViewedProductsSection";
import ProductCategoriesSection from "./ProductCategoriesSection";
import ProductsSection from "./ProductsSection";
import RoomsSection from "./RoomsSection";
import TextSection from "./TextSection";
import ToursSection from "./ToursSection";
import YoutubeSection from "./YoutubeSection";
import StatsSection from "./StatsSection";
import FeaturesSection from "./FeaturesSection";
import FaqSection from "./FaqSection";
import TestimonialsSection from "./TestimonialsSection";
import HowItWorksSection from "./HowItWorksSection";
import RequestCategoriesSection from "./RequestCategoriesSection";
import RequestFormSection from "./RequestFormSection";
import TrackRequestSection from "./TrackRequestSection";

export const sectionComponents = {
  hero: HeroSection,
  imageText: AboutSection,
  tours: ToursSection,
  form: FormSection,
  youtube: YoutubeSection,
  cmsPosts: CmsPostsSection,
  gallery: GallerySection,
  contact: ContactSection,
  text: TextSection,
  content: TextSection,
  products: ProductsSection,
  productCategories: ProductCategoriesSection,
  carousel: CarouselSection,
  lastViewedProducts: LastViewedProductsSection,
  banner: BannerSection,
  "booking-form": BookingFormSection,
  bookingForm: BookingFormSection,
  rooms: RoomsSection,
  stats: StatsSection,
  features: FeaturesSection,
  faq: FaqSection,
  testimonials: TestimonialsSection,
  howItWorks: HowItWorksSection,
  // Ticket templates. channelId/pipelineId/statusId come from section
  // config or NEXT_PUBLIC_ERXES_TICKET_* — see lib/ticketConfig.ts.
  requestCategories: RequestCategoriesSection,
  requestForm: RequestFormSection,
  trackRequest: TrackRequestSection,
};
