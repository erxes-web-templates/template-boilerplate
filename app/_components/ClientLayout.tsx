// @ts-nocheck

"use client";

import Header from "./Header";
import Footer from "./Footer";
import { useParams, useSearchParams } from "next/navigation";
import useClientPortal from "@/hooks/useClientPortal";
import TourBoilerPlateHome from "../_client/HomePage";
import ToursPage from "../_client/ToursPage";
import TourDetailPage from "../_client/TourDetailPage";
import AboutPage from "../_client/AboutPage";
import LoginPage from "../auth/login/page";
import ProfilePage from "../profile/page";
import RegisterPage from "../auth/register/page";
import ContactPage from "../_client/ContactPage";
import ProductsPage from "../_client/ProductsPage";
import LegalPage from "../legal/page";
import PostDetailPage from "../_client/BlogPostPage";
import ProductDetailPage from "../_client/ProductDetailPage";
import BlogsPage from "../_client/BlogPage";
import { GET_CMS_PAGES } from "../../graphql/queries";
import { useQuery } from "@apollo/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import PageLoader from "@/components/common/PageLoader";
import Script from "next/script";
import { getEnv } from "@/lib/utils";
import InquiryPage from "../inquiry/page";
import CheckoutPage from "../checkout/page";
import { CartProvider } from "../../lib/CartContext";
import PaymentPage from "../payment/page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BookingPage from "../_client/BookingPage";
import RoomsPage from "../_client/RoomsPage";
import RoomDetailPage from "../_client/RoomDetailPage";
import ConfirmationPage from "../_client/ConfirmationPage";

/**
 * Pick a readable foreground for whatever primary the client chose.
 *
 * The footer sits on `--primary`. With a fixed near-white foreground a light
 * brand colour left it white-on-white, so the contrast has to be computed from
 * the colour actually configured rather than assumed. Returns HSL channels,
 * because Tailwind wraps `--primary-foreground` in `hsl()`.
 */
const readableOn = (hex?: string | null): string | null => {
  if (!hex) return null;
  const value = hex.trim().replace("#", "");
  const full =
    value.length === 3
      ? value.split("").map((c) => c + c).join("")
      : value;
  if (full.length !== 6 || /[^0-9a-f]/i.test(full)) return null;

  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  // Relative luminance, WCAG 2.x.
  const channel = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

  return luminance > 0.45 ? "240 10% 4%" : "0 0% 98%";
};

/**
 * Same contrast test as `readableOn`, but returning a colour rather than HSL
 * channels: Tailwind maps `accent.foreground` to a bare `var(--accent-foreground)`,
 * so channels alone would not be a valid colour there.
 */
const readableHexOn = (hex?: string | null): string | null => {
  const channels = readableOn(hex);
  if (!channels) return null;
  return channels === "0 0% 98%" ? "#fafafa" : "#0b0c0e";
};

const standardComponentRegistry = {
  home: TourBoilerPlateHome,
  tours: ToursPage,
  tour: TourDetailPage,
  about: AboutPage,
  login: LoginPage,
  "auth/login": LoginPage,
  register: RegisterPage,
  contact: ContactPage,
  terms: LegalPage,
  privacy: LegalPage,
  blogs: BlogsPage,
  post: PostDetailPage,
  inquiry: InquiryPage,
  checkout: CheckoutPage,
  products: ProductsPage,
  product: ProductDetailPage,
  profile: ProfilePage,
  payment: PaymentPage,
  booking: BookingPage,
  rooms: RoomsPage,
  room: RoomDetailPage,
  confirmation: ConfirmationPage,
};

export default function ClientBoilerplateLayout() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const { cpDetail } = useClientPortal({ id: params.id });
  const pageName = searchParams.get("pageName");
  const [CustomPageComponent, setCustomPageComponent] = useState(null);

  const [DynamicComponent, setDynamicComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data, loading } = useQuery(GET_CMS_PAGES, {
    variables: {
      clientPortalId: params.id || process.env.ERXES_CP_ID,
    },
  });

  const customPage = data?.cmsPages?.find(
    (page: any) => page.slug === pageName,
  );

  const env = getEnv();
  const posToken = env.NEXT_PUBLIC_POS_TOKEN || "";
  const missingPosToken = !posToken;

  // The preview runs on the template's own origin, where the builder's
  // localStorage env may not have arrived yet — never throw on a missing URL.
  const baseUrl = (() => {
    try {
      return new URL(env.NEXT_PUBLIC_API_URL).origin.replace(".api.", ".app.");
    } catch {
      return "";
    }
  })();
  console.log(baseUrl, "base URL");
  // Check if this is a custom page that needs dynamic handling
  const isCustomCmsPage = Boolean(
    customPage && !standardComponentRegistry[pageName],
  );

  useEffect(() => {
    if (!isCustomCmsPage) {
      setCustomPageComponent(null);
      return;
    }

    setIsLoading(true);

    // Create a dynamic component to render the custom CMS page
    const loadCustomComponent = async () => {
      try {
        // Load the CMS page renderer component
        const DynamicCmsRenderer = dynamic(() => import("../custom/page"), {
          loading: () => <PageLoader />,
        });

        // Create a wrapper component with a proper display name
        const WrappedComponent = (props) => (
          <DynamicCmsRenderer page={customPage} {...props} />
        );

        // Set a display name for the component
        WrappedComponent.displayName = `CmsPage_${
          customPage?.slug || "Unknown"
        }`;

        setCustomPageComponent(() => WrappedComponent);
        setError(null);
      } catch (err) {
        console.error("Failed to load CMS page renderer:", err);
        setError(`Error loading CMS page: ${err.message}`);
        setCustomPageComponent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomComponent();
  }, [customPage, isCustomCmsPage, pageName]);

  useEffect(() => {
    const appearances = cpDetail?.appearances;
    const styles = cpDetail?.styles;
    if (!appearances && !styles) return;

    const root = document.documentElement;
    const setVar = (variable: string, value?: string | null) => {
      if (value) root.style.setProperty(variable, value);
    };

    setVar("--primary", appearances?.primaryColor || styles?.baseColor);
    setVar("--primary-foreground", readableOn(appearances?.primaryColor || styles?.baseColor));
    setVar(
      "--background",
      appearances?.backgroundColor || styles?.backgroundColor,
    );
    setVar("--secondary-color", appearances?.secondaryColor);
    setVar(
      "--accent",
      appearances?.accentColor || (styles as any)?.activeTabColor,
    );
    setVar(
      "--accent-foreground",
      readableHexOn(appearances?.accentColor || (styles as any)?.activeTabColor),
    );

    const bodyFont =
      appearances?.fontSans || styles?.baseFont || (styles as any)?.fontBody;
    const headingFont =
      appearances?.fontHeading ||
      styles?.headingFont ||
      (styles as any)?.fontHeading;

    setVar("--font-body", bodyFont);
    setVar("--font-heading", headingFont || bodyFont);
    setVar("--font-mono", appearances?.fontMono);
  }, [cpDetail]);

  const renderPageContent = () => {
    if (loading) return <PageLoader />;
    if (!pageName) return null;

    // For standard pre-defined pages, use the registry
    const StandardComponent = standardComponentRegistry[pageName];

    if (StandardComponent) {
      return <StandardComponent />;
    }

    // For custom CMS pages
    if (isCustomCmsPage) {
      if (isLoading) {
        return <PageLoader />;
      }

      if (error) {
        return <div>{error}</div>;
      }

      if (CustomPageComponent) {
        return <CustomPageComponent />;
      }
    }

    // Page not found case
    return <div>Page not found</div>;
  };

  return (
    <div className="bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.03),transparent_50%)] pointer-events-none" />

      {missingPosToken && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-50 border-b border-amber-200/50 backdrop-blur-sm relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Alert
              variant="destructive"
              className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 p-4 text-amber-900 animate-in fade-in zoom-in-95 duration-700"
            >
              <AlertTitle className="font-semibold text-amber-950">
                POS token required
              </AlertTitle>
              <AlertDescription className="mt-2 text-amber-800">
                This ecommerce template needs an{" "}
                <code className="px-1.5 py-0.5 bg-amber-100 rounded text-xs font-mono">
                  erxes-pos-token
                </code>{" "}
                to load products. Create a POS in erxes, copy its public token,
                then add it to the client portal&apos;s environment variables as{" "}
                <code className="px-1.5 py-0.5 bg-amber-100 rounded text-xs font-mono">
                  NEXT_PUBLIC_POS_TOKEN
                </code>
                .
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
      {cpDetail?.messengerBrandCode && (
        <Script
          id="erxes"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.erxesSettings = {
                messenger: {
                  brand_id: "${cpDetail.messengerBrandCode}",
                },
              };
              
              (() => {
                const script = document.createElement('script');
                script.src = "${baseUrl}/widgets/build/messengerWidget.bundle.js";
                script.async = true;

                const entry = document.getElementsByTagName('script')[0];
                entry.parentNode.insertBefore(script, entry);
              })();
            `,
          }}
        />
      )}
      <CartProvider>
        <div className="relative z-10 animate-in fade-in slide-in-from-top-2 duration-700">
          <Header cpDetail={cpDetail} />
        </div>
        <main className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {renderPageContent()}
        </main>
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
          <Footer cpDetail={cpDetail} />
        </div>
      </CartProvider>
    </div>
  );
}
