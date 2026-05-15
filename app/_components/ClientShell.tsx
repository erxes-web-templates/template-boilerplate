"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ApolloWrapper } from "../../lib/apollo-wrapper";
import { CartProvider } from "../../lib/CartContext";
import Header from "./Header";
import Footer from "./Footer";
import SyncConfigOnLoad from "./SyncConfigOnLoad";
import { getEnv } from "@/lib/utils";
import type { CPDetail } from "../../types/cms";

type ClientShellProps = {
  children: React.ReactNode;
  cpDetail?: (CPDetail & { messengerBrandCode?: string }) | null;
};

export default function ClientShell({ children, cpDetail }: ClientShellProps) {
  useEffect(() => {
    const appearances = cpDetail?.appearances;
    const styles = cpDetail?.styles;
    if (!appearances && !styles) return;

    const root = document.documentElement;
    const setVar = (variable: string, value?: string | null) => {
      if (value) root.style.setProperty(variable, value);
    };

    setVar("--primary", appearances?.primaryColor || styles?.baseColor);
    setVar("--background", appearances?.backgroundColor || styles?.backgroundColor);
    setVar("--secondary-color", appearances?.secondaryColor);
    setVar("--accent", appearances?.accentColor);

    const bodyFont = appearances?.fontSans || styles?.baseFont;
    const headingFont = appearances?.fontHeading || styles?.headingFont || bodyFont;

    setVar("--font-body", bodyFont);
    setVar("--font-heading", headingFont);
    setVar("--font-mono", (appearances as any)?.fontMono);
  }, [cpDetail]);
  const env = getEnv();
  const posToken =
    process.env.NEXT_PUBLIC_POS_TOKEN || env.NEXT_PUBLIC_POS_TOKEN || "";
  const missingPosToken = !posToken;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_API_URL || "";
  const baseUrl = apiUrl
    ? new URL(apiUrl).origin.replace(".api.", ".app.")
    : "";

  return (
    <ApolloWrapper>
      <SyncConfigOnLoad />
      {cpDetail?.messengerBrandCode && baseUrl && (
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
        <Header cpDetail={cpDetail as CPDetail} />
        <main>{children}</main>
        <Footer cpDetail={cpDetail as CPDetail} />
      </CartProvider>
    </ApolloWrapper>
  );
}
