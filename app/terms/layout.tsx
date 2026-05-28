import type { Metadata } from "next";
import { isBuildMode } from "../../lib/buildMode";
import { fetchWebPage } from "../../lib/fetchWebPage";
import pageData from "../../data/pages/terms.json";

export async function generateMetadata(): Promise<Metadata> {
  if (isBuildMode()) return { title: pageData.title, description: pageData.description };
  const page = await fetchWebPage(process.env.ERXES_WEB_ID || "", "terms");
  return {
    title: page?.name ?? pageData.title,
    description: page?.description ?? pageData.description,
    ...(page?.coverImage && { openGraph: { images: [page.coverImage] } }),
  };
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
