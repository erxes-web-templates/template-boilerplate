import { isBuildMode } from "../../lib/buildMode";
import RoomsPageClient from "../_client/RoomsPage";
import { fetchRooms } from "../../lib/fetchRooms";

const PER_PAGE = 12;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function RoomsPage({ searchParams }: PageProps) {
  const { page: pageParam } = isBuildMode() ? { page: undefined } : await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const initialRooms = isBuildMode() ? null : await fetchRooms(PER_PAGE, page);
  return <RoomsPageClient initialRooms={initialRooms} initialPage={page} />;
}
