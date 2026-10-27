"use client";

import { useSearchParams } from "next/navigation";
import usePage from "../_components/sections/render";
import { sectionComponents } from "../_components/sections";

const TermsPage = () => {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);
  return (
    <div>
      <PageContent />
    </div>
  );
};

export default TermsPage;
