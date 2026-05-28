"use client";

import { useSearchParams } from "next/navigation";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";

const PrivacyPage = () => {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);
  return (
    <div>
      <PageContent />
    </div>
  );
};

export default PrivacyPage;
