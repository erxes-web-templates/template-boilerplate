import type { Metadata } from "next";
import { isBuildMode } from "../../../lib/buildMode";
import { getFileUrl } from "../../../lib/utils";
import RoomDetailPageClient from "../../_client/RoomDetailPage";
import { fetchRoomDetail } from "../../../lib/fetchRooms";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (isBuildMode()) return { title: "Room" };
  const { id } = await params;
  const room = await fetchRoomDetail(id);
  return {
    title: room?.name ?? "Room",
    description: room?.description ?? undefined,
    ...(room?.attachment?.url && {
      openGraph: { images: [getFileUrl(room.attachment.url)] },
    }),
  };
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialRoom = isBuildMode() ? null : await fetchRoomDetail(id);
  return <RoomDetailPageClient initialRoomId={id} initialRoom={initialRoom} />;
}
