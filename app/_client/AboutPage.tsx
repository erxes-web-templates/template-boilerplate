"use client";

import usePage from "../../lib/usePage";
import { useSearchParams } from "next/navigation";
import React from "react";

const AboutPage = () => {
  const searchParams = useSearchParams();

  const pageName = searchParams.get("pageName"); //pageName = about, tours, contact etc
  const PageContent = usePage(pageName);
  console.log("test abaa", pageName);
  return (
    <div>
      <PageContent />
    </div>
  );
};

export default AboutPage;
