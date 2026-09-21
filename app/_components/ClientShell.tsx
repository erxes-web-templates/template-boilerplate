"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ApolloWrapper } from "../../lib/apollo-wrapper";
import { CartProvider } from "../../lib/CartContext";
import Header from "./Header";
import Footer from "./Footer";
import SyncConfigOnLoad from "./SyncConfigOnLoad";
import { getEnv } from "@/lib/utils";
import type { CPDetail } from "../../types/cms";

type ClientShellProps = {
  children: React.ReactNode;
  cpDetail?: (CPDetail & { integrations?: { messengerBrandCode?: string } }) | null;
};

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

export default function ClientShell({ children, cpDetail }: ClientShellProps) {
  // The builder preview route (/dashboard/projects/<id>) renders ClientLayout,
  // which supplies its own Header and Footer. Rendering them here too would
  // double the chrome, so this shell drops to providers only on that path.
  const pathname = usePathname();
  const isBuilderPreview = pathname?.includes("/dashboard/projects/") ?? false;

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
    setVar("--background", appearances?.backgroundColor || styles?.backgroundColor);
    setVar("--secondary-color", appearances?.secondaryColor);
    setVar("--accent", appearances?.accentColor);
    setVar("--accent-foreground", readableHexOn(appearances?.accentColor));

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
      {cpDetail?.integrations?.messengerBrandCode && baseUrl && (
        <Script
          id="erxes"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.erxesSettings = {
                messenger: {
                  brand_id: "${cpDetail.integrations?.messengerBrandCode}",
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
        {isBuilderPreview ? (
          children
        ) : (
          <>
            <Header cpDetail={cpDetail as CPDetail} />
            <main>{children}</main>
            <Footer cpDetail={cpDetail as CPDetail} />
          </>
        )}
      </CartProvider>
    </ApolloWrapper>
  );
}
