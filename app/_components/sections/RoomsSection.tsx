"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useRoomsQuery,
  useTagsQuery,
  type RoomSummary,
} from "../../../graphql/pms/rooms";
import { Section } from "../../../types/sections";
import { toHtml } from "../../../lib/html";
import { templateUrl } from "@/lib/utils";
import { isBuildMode } from "../../../lib/buildMode";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";

const toCurrency = (value?: number | null) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `₮${Math.round(value).toLocaleString()}`;
};

const RoomsSection = ({ section }: { section: Section }) => {
  const limit = Number(section.config?.limit ?? 6);
  const categoryId = section.config?.categoryId || null;
  const tag = section.config?.tag || null;
  const isBuilder = isBuildMode();

  const { data: tagsData } = useTagsQuery({
    variables: { searchValue: "accommodation", type: "core:product" },
  });
  const accommodationTagId = tagsData?.cpTags?.[0]?._id;

  const { data, loading, error } = useRoomsQuery({
    variables: {
      perPage: limit,
      page: 1,
      categoryId: categoryId || undefined,
      tag: tag || undefined,
      sortField: "createdAt",
      sortDirection: -1,
      ...(accommodationTagId ? { tagIds: [accommodationTagId] } : {}),
    },
    fetchPolicy: "cache-first",
  });

  const rooms = useMemo(() => {
    const payload = data?.cpProducts as unknown;
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    return [];
  }, [data]);

  const title = section.name;
  const description = section.config?.description || "";

  if (!loading && !error && rooms.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <EmptyState
            title="No rooms available"
            description="Try adjusting your filters or add rooms from the hotel management system."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {(title || description) && (
          <div className="mb-10">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Unable to load rooms. Please try again later.
          </div>
        )}

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? Array.from({ length: limit || 4 }) : rooms).map(
            (room: RoomSummary, index: number) => {
              if (loading) {
                return (
                  <Card
                    key={`placeholder-${index}`}
                    className="animate-pulse overflow-hidden"
                  >
                    <CardHeader className="h-48 bg-muted p-0" />
                    <CardContent className="space-y-2 p-4">
                      <div className="h-4 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </CardContent>
                  </Card>
                );
              }

              const imageUrl = room?.attachment?.url;
              const price = toCurrency(room?.unitPrice);

              return (
                <Card
                  key={room?._id || index}
                  className="group flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-md"
                >
                  <CardHeader className="p-0">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={room?.name ?? ""}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2 p-4">
                    <CardTitle className="text-sm font-medium leading-snug line-clamp-2">
                      {room?.name ?? "Untitled room"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      <span
                        dangerouslySetInnerHTML={toHtml(
                          room?.description ?? "",
                        )}
                      />
                    </CardDescription>
                    <div className="mt-auto pt-1">
                      <span className="text-sm font-semibold text-primary">
                        {price}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center gap-2 border-t border-border p-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <Link
                        href={
                          isBuilder
                            ? templateUrl(`/room&roomId=${room._id}`)
                            : `/rooms/${room._id}`
                        }
                      >
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 text-xs">
                      <Link
                        href={
                          isBuilder
                            ? templateUrl(`/room&roomId=${room._id}&book=true`)
                            : `/rooms/${room._id}?book=true`
                        }
                      >
                        Book now
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            },
          )}
        </div>

        {section.config?.primaryCtaUrl && (
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link
                href={
                  isBuilder
                    ? templateUrl(section.config.primaryCtaUrl)
                    : section.config.primaryCtaUrl
                }
              >
                {section.config.primaryCta || "View all rooms"}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RoomsSection;
