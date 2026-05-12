import { isBuildMode } from "../../../lib/buildMode";
import TourDetailPageClient from "../../_client/TourDetailPage";
import { fetchBmTourDetail } from "../../../lib/fetchTours";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TourDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialTourDetail = isBuildMode() ? null : await fetchBmTourDetail(id);
  return <TourDetailPageClient initialTourId={id} initialTourDetail={initialTourDetail} />;
}
