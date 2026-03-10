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

const standardComponentRegistry = {
  home: TourBoilerPlateHome,
  tours: ToursPage,
  tour: TourDetailPage,
  about: AboutPage,
  login: LoginPage,
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
  console.log(cpDetail, "api");
  const baseUrl = new URL(env.NEXT_PUBLIC_API_URL).origin.replace(
    ".api.",
    ".app.",
  );
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
    const styles = cpDetail?.styles;
    if (!styles) {
      return;
    }

    const root = document.documentElement;
    const setVar = (variable: string, value?: string | null) => {
      if (value) {
        root.style.setProperty(variable, value);
      }
    };

    setVar("--primary", styles.baseColor);
    setVar("--background", styles.backgroundColor);
    setVar("--accent", styles.activeTabColor);

    const bodyFont = styles.baseFont || styles.fontBody;
    const headingFont = styles.headingFont || styles.fontHeading;

    setVar("--font-body", bodyFont);
    setVar("--font-heading", headingFont || bodyFont);
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
