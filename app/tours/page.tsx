import { isBuildMode } from "../../lib/buildMode";
import ToursPageClient from "../_client/ToursPage";
import { fetchBmTours } from "../../lib/fetchTours";

export default async function ToursPage() {
  const initialData = isBuildMode() ? null : await fetchBmTours(100, { status: "published" });
  return <ToursPageClient initialData={initialData} />;
}
