"use client";

import usePage from "../_components/sections/render";
import { sectionComponents } from "../_components/sections";

export default function ProductsPageSections() {
  const PageContent = usePage("products", sectionComponents);
  return <PageContent />;
}
