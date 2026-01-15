"use client";

import Script from "next/script";
import { ApolloWrapper } from "../../lib/apollo-wrapper";
import { CartProvider } from "../../lib/CartContext";
import Header from "./Header";
import Footer from "./Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getEnv } from "@/lib/utils";
import type { CPDetail } from "../../types/cms";

type ClientShellProps = {
  children: React.ReactNode;
  cpDetail?: (CPDetail & { messengerBrandCode?: string }) | null;
};

export default function ClientShell({ children, cpDetail }: ClientShellProps) {
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
      {missingPosToken && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <Alert
              variant="destructive"
              className="bg-transparent border-none p-0 text-amber-900"
            >
              <AlertTitle>POS token required</AlertTitle>
              <AlertDescription>
                This ecommerce template needs an <code>erxes-pos-token</code> to
                load products. Create a POS in erxes, copy its public token,
                then add it to the client portal&apos;s environment variables as{" "}
                <code>NEXT_PUBLIC_POS_TOKEN</code>.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
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
