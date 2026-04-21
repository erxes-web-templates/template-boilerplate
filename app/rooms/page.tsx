import Link from "next/link";
import Image from "next/image";
import { fetchRooms } from "../../lib/fetchRooms";
import { getFileUrl } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 12;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function RoomsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const rooms = await fetchRooms(PER_PAGE, page);
  const hasNext = rooms.length === PER_PAGE;
  const hasPrev = page > 1;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((room) => (
          <Link
            key={room._id}
            href={`/rooms/${room._id}`}
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
                  ₮{Math.round(room.unitPrice).toLocaleString()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {(hasPrev || hasNext) && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            className="gap-1"
          >
            <Link href={`/rooms?page=${page - 1}`}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">{page}</span>
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={!hasNext}
            className="gap-1"
          >
            <Link href={`/rooms?page=${page + 1}`}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
