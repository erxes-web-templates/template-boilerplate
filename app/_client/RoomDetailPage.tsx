"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { queries as roomQueries, useTagsQuery } from "../../graphql/pms/rooms";
import type { RoomSummary } from "../../graphql/pms/rooms";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";
import Image from "next/image";
import Link from "next/link";
import { templateUrl } from "../../lib/utils";
import { toHtml } from "../../lib/html";
import RoomBookingWidget from "../rooms/_components/RoomBookingWidget";
import { ArrowLeft } from "lucide-react";

type Props = {
  initialRoomId?: string;
  initialRoom?: any;
};

export default function RoomDetailPage({ initialRoomId, initialRoom }: Props) {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);

  const roomId = searchParams.get("roomId") ?? initialRoomId;
  const skip = !!initialRoom;

  const { data: tagsData } = useTagsQuery({
    variables: { searchValue: "accommodation", type: "core:product" },
    skip,
  });
  const accommodationTagId = tagsData?.cpTags?.[0]?._id;

  const { data, loading } = useQuery<{ cpProducts: RoomSummary[] }>(
    roomQueries.cpProducts,
    {
      variables: {
        ids: [roomId],
        perPage: 1,
        page: 1,
        ...(accommodationTagId ? { tagIds: [accommodationTagId] } : {}),
      },
      skip: skip || !roomId,
    },
  );

  const room = useMemo(() => {
    if (initialRoom) return initialRoom as RoomSummary;
    const list = data?.cpProducts;
    if (!Array.isArray(list)) return null;
    return list[0] ?? null;
  }, [initialRoom, data]);

  if (!skip && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{ borderColor: "var(--primary) transparent transparent transparent" }}
          />
          <p className="text-muted-foreground text-sm">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Room Not Found</h1>
          <Link
            href={templateUrl("/rooms")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  const gallery = room.attachmentMore?.filter((a) => a?.url) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      {room.attachment?.url && (
        <div className="relative w-full h-[55vh] min-h-[360px] overflow-hidden">
          <Image
            src={room.attachment.url}
            alt={room.name ?? ""}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute top-6 left-6">
            <Link
              href={templateUrl("/rooms")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-medium border border-white/20 hover:bg-white/25 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All Rooms
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="container mx-auto max-w-5xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
                {room.name}
              </h1>
              {room.unitPrice != null && (
                <span
                  className="px-4 py-2 rounded-xl text-white font-bold text-lg shadow-lg"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  ₮{Number(room.unitPrice).toLocaleString()} / night
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {gallery.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gallery.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden"
                    >
                      <Image
                        src={img.url!}
                        alt={`${room.name} photo ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {room.description && (
              <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">About This Room</h2>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={toHtml(room.description)}
                />
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm space-y-2 text-sm">
              {room.category?.name && (
                <p>
                  <strong>Category:</strong> {room.category.name}
                </p>
              )}
              {room.code && (
                <p>
                  <strong>Code:</strong> {room.code}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <RoomBookingWidget room={room} />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <PageContent />
        </div>
      </div>
    </div>
  );
}
