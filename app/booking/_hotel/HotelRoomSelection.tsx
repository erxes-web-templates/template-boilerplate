"use client";

import Image from "next/image";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { getFileUrl } from "../../../lib/utils";
import type { HotelRoom } from "./types";

type Props = {
  startDateRaw: string | null;
  endDateRaw: string | null;
  adults: number;
  childCount: number;
  requestedRooms: number;
  loadingRooms: boolean;
  roomsError?: { message?: string } | null;
  availableRooms: HotelRoom[];
  selectedRoomIds: string[];
  onToggleRoom: (roomId: string) => void;
};

export default function HotelRoomSelection({
  startDateRaw,
  endDateRaw,
  adults,
  childCount,
  requestedRooms,
  loadingRooms,
  roomsError,
  availableRooms,
  selectedRoomIds,
  onToggleRoom,
}: Props) {
  return (
    <Card className="rounded-2xl border border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle>Select Rooms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {startDateRaw && endDateRaw
            ? `Dates: ${startDateRaw} -> ${endDateRaw}`
            : "Add start and end dates to check availability."}
          <div>
            {adults} adult{adults === 1 ? "" : "s"}
            {childCount > 0
              ? `, ${childCount} child${childCount === 1 ? "" : "ren"}`
              : ""}
            {`, ${requestedRooms} room${requestedRooms === 1 ? "" : "s"}`}
          </div>
        </div>

        {loadingRooms && (
          <div className="text-sm text-muted-foreground">
            Checking available rooms...
          </div>
        )}

        {roomsError?.message && (
          <div className="text-sm text-destructive">{roomsError.message}</div>
        )}

        {!loadingRooms && availableRooms.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No rooms available for these dates.
          </div>
        )}

        {availableRooms.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {availableRooms.map((room) => {
              const isSelected = selectedRoomIds.includes(room._id);

              return (
                <div
                  key={room._id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  {room.attachment?.url && (
                    <div className="relative mb-3 h-40 w-full overflow-hidden rounded-md">
                      <Image
                        src={getFileUrl(room.attachment.url)}
                        alt={room.name || "Room image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="font-semibold">{room.name || "Room"}</div>
                  <div className="text-sm text-muted-foreground">
                    {room.category?.name || "Uncategorized"}
                  </div>
                  <div className="mt-2 text-sm">
                    MNT {Number(room.unitPrice || 0).toLocaleString()} / night
                  </div>
                  {room.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {room.description}
                    </p>
                  )}
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    variant={isSelected ? "outline" : "default"}
                    onClick={() => onToggleRoom(room._id)}
                  >
                    {isSelected ? "Remove Room" : "Select Room"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
