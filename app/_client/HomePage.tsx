"use client";

import { useSearchParams } from "next/navigation";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";
import RoomsPage from "./RoomsPage";
import RoomDetailPage from "./RoomDetailPage";

export default function TourBoilerPlateHome() {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);

  if (pageName === "rooms") {
    return <RoomsPage />;
  }

  if (pageName === "room") {
    return <RoomDetailPage />;
  }

  return (
    <div>
      <PageContent />
    </div>
  );
}
