import Image from "next/image";
import Link from "next/link";
import { fetchRoomDetail } from "../../../lib/fetchRooms";
import { ArrowLeft } from "lucide-react";
import RoomBookingWidget from "../_components/RoomBookingWidget";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomDetailPage({ params }: PageProps) {
  const { id } = await params;
  const room = await fetchRoomDetail(id);

  if (!room) {
    return <div className="container mx-auto p-4">Room not found.</div>;
  }

  const gallery = room.attachmentMore?.filter((a) => a?.url) ?? [];

  return (
    <div className="container mx-auto p-4 py-10">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        All Rooms
      </Link>

      {room.attachment?.url && (
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-6">
          <Image
            src={room.attachment.url}
            alt={room.name ?? ""}
            fill
            className="object-cover"
          />
        </div>
      )}

      {gallery.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {gallery.map((img, index) => (
            <div
              key={index}
              className="relative shrink-0 w-[280px] h-[180px] rounded-xl overflow-hidden"
            >
              <Image
                src={img.url!}
                alt={room.name ?? ""}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">{room.name}</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm space-y-2">
            {room.category?.name && (
              <p>
                <strong>Category:</strong> {room.category.name}
              </p>
            )}
            {room.unitPrice != null && (
              <p>
                <strong>Price per night:</strong> ₮
                {Math.round(room.unitPrice).toLocaleString()}
              </p>
            )}
            {room.code && (
              <p>
                <strong>Code:</strong> {room.code}
              </p>
            )}
          </div>

          {room.description && (
            <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {room.description}
              </p>
            </div>
          )}
        </div>

        <div className="sticky top-24">
          <RoomBookingWidget room={room} />
        </div>
      </div>
    </div>
  );
}
