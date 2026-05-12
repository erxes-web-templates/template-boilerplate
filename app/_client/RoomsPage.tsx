"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRoomsQuery, useTagsQuery, type RoomSummary } from "../../graphql/pms/rooms";
import { templateUrl, getFileUrl } from "../../lib/utils";
import { useSearchParams } from "next/navigation";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";
import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const toCurrency = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `₮${Math.round(value).toLocaleString()}`;
};

const PER_PAGE = 12;

type Props = {
  initialRooms?: any[] | null;
  initialPage?: number;
};

const RoomsPage = ({ initialRooms, initialPage }: Props) => {
  const searchParams = useSearchParams();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);
  const [page, setPage] = useState(initialPage ?? 1);
  const [useServerData, setUseServerData] = useState(!!initialRooms);

  const { data: tagsData } = useTagsQuery({
    variables: { searchValue: "accommodation", type: "core:product" },
    skip: useServerData,
  });
  const accommodationTagId = tagsData?.cpTags?.[0]?._id;

  const { data, loading } = useRoomsQuery({
    variables: {
      perPage: PER_PAGE,
      page,
      sortField: "createdAt",
      sortDirection: -1,
      ...(accommodationTagId ? { tagIds: [accommodationTagId] } : {}),
    },
    skip: useServerData,
  });

  const rooms = useMemo(() => {
    if (useServerData && initialRooms) return initialRooms as RoomSummary[];
    const payload = data?.cpProducts as unknown;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as RoomSummary[];
    return [];
  }, [useServerData, initialRooms, data]);

  const hasNext = rooms.length === PER_PAGE;
  const hasPrev = page > 1;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setUseServerData(false);
  };

  if (!useServerData && loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: PER_PAGE }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-border/50 overflow-hidden"
          >
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-8">
        {rooms.map((room) => (
          <Link
            key={room._id}
            href={templateUrl(`/rooms/${room._id}`)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              {room.attachment?.url ? (
                <Image
                  src={getFileUrl(room.attachment.url)}
                  alt={room.name ?? ""}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
                  —
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1 p-4">
              <p className="font-semibold text-sm leading-snug line-clamp-2 text-foreground">
                {room.name}
              </p>
              {room.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {room.description}
                </p>
              )}
              {room.unitPrice != null && (
                <p className="mt-auto pt-2 text-sm font-bold text-primary">
                  {toCurrency(room.unitPrice)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {(hasPrev || hasNext) && (
        <div className="mt-10 flex items-center justify-center gap-3 pb-8">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            className="gap-1"
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">{page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            className="gap-1"
            onClick={() => handlePageChange(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <PageContent />
    </>
  );
};

export default RoomsPage;
