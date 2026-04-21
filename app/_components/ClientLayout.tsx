"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ApolloWrapper } from "../../lib/apollo-wrapper";
import { CartProvider } from "../../lib/CartContext";
import Header from "./Header";
import Footer from "./Footer";
import SyncConfigOnLoad from "./SyncConfigOnLoad";
import useClientPortal from "../../hooks/useClientPortal";
import usePage from "../../lib/usePage";

function ClientLayoutInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName") ?? "home";

  const { cpDetail } = useClientPortal({ id: params.id });
  const PageContent = usePage(pageName);

  return (
    <CartProvider>
      <SyncConfigOnLoad />
      <Header cpDetail={cpDetail} />
      <main>
        <PageContent />
      </main>
      <Footer cpDetail={cpDetail} />
    </CartProvider>
  );
}

export default function ClientLayout() {
  return (
    <ApolloWrapper>
      <ClientLayoutInner />
    </ApolloWrapper>
  );
}
