import type { Metadata } from "next";
import { isBuildMode } from "../../../lib/buildMode";
import TourDetailPageClient from "../../_client/TourDetailPage";
import { fetchBmTourDetail } from "../../../lib/fetchTours";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (isBuildMode()) return { title: "Tour" };
  const { id } = await params;
  const tour = await fetchBmTourDetail(id);
  return {
    title: tour?.name ?? "Tour",
    ...(tour?.imageThumbnail && {
      openGraph: { images: [tour.imageThumbnail] },
    }),
  };
}

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialTourDetail = isBuildMode() ? null : await fetchBmTourDetail(id);
  return <TourDetailPageClient initialTourId={id} initialTourDetail={initialTourDetail} />;
}
