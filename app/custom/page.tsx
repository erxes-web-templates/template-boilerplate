"use client";

import usePage from "../../lib/usePage";
import { useSearchParams } from "next/navigation";
import React from "react";

const CmsPageRenderer = () => {
  const searchParams = useSearchParams();

  const pageName = searchParams.get("pageName"); //pageName = about, tours, contact etc

  const PageContent = usePage(pageName);

  return (
    <div className="cms-page-container">
      <PageContent />
    </div>
  );
};

export default CmsPageRenderer;
