import { isBuildMode } from "../../../lib/buildMode";
import RoomDetailPageClient from "../../_client/RoomDetailPage";
import { fetchRoomDetail } from "../../../lib/fetchRooms";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialRoom = isBuildMode() ? null : await fetchRoomDetail(id);
  return <RoomDetailPageClient initialRoomId={id} initialRoom={initialRoom} />;
}
