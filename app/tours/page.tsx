import type { Metadata } from "next";
import { isBuildMode } from "../../lib/buildMode";
import ToursPageClient from "../_client/ToursPage";
import { fetchBmTours } from "../../lib/fetchTours";
import { fetchWebPage } from "../../lib/fetchWebPage";

export async function generateMetadata(): Promise<Metadata> {
  if (isBuildMode()) return { title: "Tours" };
  const page = await fetchWebPage(process.env.ERXES_WEB_ID || "", "tours");
  return {
    title: page?.name ?? "Tours",
    description: page?.description ?? undefined,
    ...(page?.coverImage && { openGraph: { images: [page.coverImage] } }),
  };
}

export default async function ToursPage() {
  const initialData = isBuildMode() ? null : await fetchBmTours(100, { status: "published" });
  return <ToursPageClient initialData={initialData} />;
}
