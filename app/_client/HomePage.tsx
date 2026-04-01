"use client";

import { useSearchParams } from "next/navigation";
import usePage from "../../lib/usePage";
import RoomsPage from "./RoomsPage";
import RoomDetailPage from "./RoomDetailPage";

export default function TourBoilerPlateHome() {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");

  if (pageName === "rooms") {
    return <RoomsPage />;
  }

  if (pageName === "room") {
    return <RoomDetailPage />;
  }

  const PageContent = usePage(pageName);

  return (
    <div>
      <PageContent />
    </div>
  );
}
