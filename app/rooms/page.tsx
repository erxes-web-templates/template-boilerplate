import type { Metadata } from "next";
import { isBuildMode } from "../../lib/buildMode";
import RoomsPageClient from "../_client/RoomsPage";
import { fetchRooms } from "../../lib/fetchRooms";
import { fetchWebPage } from "../../lib/fetchWebPage";

const PER_PAGE = 12;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  if (isBuildMode()) return { title: "Rooms" };
  const page = await fetchWebPage(process.env.ERXES_WEB_ID || "", "rooms");
  return {
    title: page?.name ?? "Rooms",
    description: page?.description ?? undefined,
    ...(page?.coverImage && { openGraph: { images: [page.coverImage] } }),
  };
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const { page: pageParam } = isBuildMode() ? { page: undefined } : await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const initialRooms = isBuildMode() ? null : await fetchRooms(PER_PAGE, page);
  return <RoomsPageClient initialRooms={initialRooms} initialPage={page} />;
}
