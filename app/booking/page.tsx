"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import pmsRoomQueries from "../../graphql/pms/rooms/queries";
import pmsConfigQueries from "../../graphql/pms/config/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const parsePipelineConfig = (value: unknown) => {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === "object") {
    return value;
  }
  return null;
};

const toIsoDate = (value: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

const BookingPage = () => {
  const searchParams = useSearchParams();
  const startDateRaw = searchParams.get("startDate");
  const endDateRaw = searchParams.get("endDate");

  const startDate = toIsoDate(startDateRaw);
  const endDate = toIsoDate(endDateRaw);

  const { data: branchData, loading: branchLoading } = useQuery(
    pmsConfigQueries.PmsBranchList,
    {
      variables: { page: 1, perPage: 1 },
    }
  );

  const pipelineId = useMemo(() => {
    const rawConfig = branchData?.pmsBranchList?.[0]?.pipelineConfig;
    const parsedConfig = parsePipelineConfig(rawConfig);
    if (parsedConfig && typeof parsedConfig === "object") {
      return (parsedConfig as { pipelineId?: string }).pipelineId || null;
    }
    return null;
  }, [branchData]);

  const shouldQuery = Boolean(startDate && endDate && pipelineId);

  const {
    data: roomsData,
    loading: roomsLoading,
    error: roomsError,
  } = useQuery(pmsRoomQueries.checkRooms, {
    variables: {
      pipelineId,
      startDate,
      endDate,
    },
    skip: !shouldQuery,
  });

  const rooms = roomsData?.pmsCheckRooms ?? [];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Available rooms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {startDateRaw && endDateRaw
                ? `Dates: ${startDateRaw} → ${endDateRaw}`
                : "Pick dates from the booking form to see availability."}
            </div>
            {branchLoading && (
              <div className="text-sm text-muted-foreground">
                Loading branch configuration...
              </div>
            )}
            {!branchLoading && !pipelineId && (
              <div className="text-sm text-muted-foreground">
                Missing pipeline configuration. Please connect a PMS branch.
              </div>
            )}
            {roomsLoading && (
              <div className="text-sm text-muted-foreground">
                Checking available rooms...
              </div>
            )}
            {roomsError && (
              <div className="text-sm text-destructive">
                {roomsError.message}
              </div>
            )}
            {!roomsLoading && shouldQuery && rooms.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No rooms available for these dates.
              </div>
            )}
            {rooms.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {rooms.map((room: any) => (
                  <div
                    key={room._id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="font-semibold">{room.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {room.category?.name || "Uncategorized"}
                    </div>
                    {room.unitPrice && (
                      <div className="text-sm mt-2">
                        {Number(room.unitPrice).toLocaleString()} MNT
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BookingPage;
