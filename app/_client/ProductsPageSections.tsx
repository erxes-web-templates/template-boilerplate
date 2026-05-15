"use client";

import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";

export default function ProductsPageSections() {
  const PageContent = usePage("products", sectionComponents);
  return <PageContent />;
}
