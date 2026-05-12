"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useApolloClient, useQuery } from "@apollo/client";
import pmsRoomQueries from "../../graphql/pms/rooms/queries";
import pmsConfigQueries from "../../graphql/pms/config/queries";
import pmsExtraQueries from "../../graphql/pms/extras/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import usePage from "../../lib/usePage";
import { sectionComponents } from "../_components/sections";
import Image from "next/image";
import { getFileUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "../../lib/CartContext";
import { templateUrl } from "../../lib/utils";
import TourBookingForm from "../booking/_components/BookingForm";
import webQueries from "../../graphql/web/queries";

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

const HotelBookingPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageName = searchParams.get("pageName");
  const PageContent = usePage(pageName, sectionComponents);
  const client = useApolloClient();
  const { addToCart } = useCart();

  const startDateRaw = searchParams.get("startDate");
  const endDateRaw = searchParams.get("endDate");
  const adults = searchParams.get("adults");
  const children = searchParams.get("children");
  const rooms = searchParams.get("rooms");

  const startDate = toIsoDate(startDateRaw);
  const endDate = toIsoDate(endDateRaw);
  const categoryId = "YgqlCf1xH-aBaP_Vhrwvk";
  const [productIds, setProductIds] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const addTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (addTimer.current) {
        clearTimeout(addTimer.current);
      }
    };
  }, []);

  const { data: branchData, loading: branchLoading } = useQuery(
    pmsConfigQueries.PmsBranchList,
    {
      variables: { page: 1, perPage: 1 },
    },
  );

  const pipelineId = useMemo(() => {
    const rawConfig = branchData?.pmsBranchList?.[0]?.pipelineConfig;
    const parsedConfig = parsePipelineConfig(rawConfig);
    if (parsedConfig && typeof parsedConfig === "object") {
      return (parsedConfig as { pipelineId?: string }).pipelineId || null;
    }
    return null;
  }, [branchData]);

  const { data: categoryData, loading: categoryLoading } = useQuery(
    pmsExtraQueries.categories,
    {
      variables: {
        parentId: categoryId,
        withChild: true,
      },
    },
  );

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const categories = categoryData?.cpProductCategories ?? [];
      const categoryIds = categories.length
        ? categories.map((item: { _id: string }) => item._id)
        : [categoryId];

      const results = await Promise.all(
        categoryIds.map((id: string) =>
          client.query({
            query: pmsRoomQueries.rooms,
            variables: {
              categoryId: id,
              perPage: 200,
              page: 1,
              pipelineId: pipelineId || undefined,
            },
            fetchPolicy: "network-only",
          }),
        ),
      );

      const ids = results.flatMap(
        (result) => result.data?.products?.map((item: any) => item._id) ?? [],
      );

      if (active) {
        setProductIds(ids);
      }
    };

    if (categoryData && pipelineId) {
      loadProducts();
    }

    return () => {
      active = false;
    };
  }, [categoryData, pipelineId, client]);

  const shouldQuery = Boolean(
    startDate && endDate && pipelineId && productIds.length,
  );

  const {
    data: roomsData,
    loading: roomsLoading,
    error: roomsError,
  } = useQuery(pmsRoomQueries.checkRooms, {
    variables: {
      pipelineId,
      startDate,
      endDate,
      ids: productIds,
    },
    skip: !shouldQuery,
  });

  const roomsDataList = roomsData?.pmsCheckRooms ?? [];
  const notifyCartOpen = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(new Event("cart:open"));
  };

  const handleAddRoom = async (room: any, goToCheckout?: boolean) => {
    if (!room || isAdding) {
      return;
    }

    setIsAdding(true);
    try {
      await Promise.all([
        addToCart(
          {
            id: room._id,
            name: room.name ?? "Room",
            unitPrice: typeof room.unitPrice === "number" ? room.unitPrice : 0,
            description: room.description ?? null,
            imageUrl: room.attachment?.url ?? null,
            categoryName: room.category?.name ?? null,
          },
          1,
        ),
        new Promise((resolve) => {
          addTimer.current = setTimeout(resolve, 350);
        }),
      ]);

      notifyCartOpen();
      if (goToCheckout) {
        router.push(templateUrl("/checkout"));
      }
    } catch (error) {
      console.error("Failed to add room to cart", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Available rooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {startDateRaw && endDateRaw
              ? `Dates: ${startDateRaw} -> ${endDateRaw}`
              : "Pick dates from the booking form to see availability."}
            {(adults || children || rooms) && (
              <div>
                {adults ? `Adults: ${adults}` : null}
                {children ? `, Children: ${children}` : ""}
                {rooms ? `, Rooms: ${rooms}` : ""}
              </div>
            )}
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
          {categoryLoading && (
            <div className="text-sm text-muted-foreground">
              Loading room categories...
            </div>
          )}
          {pipelineId && !categoryLoading && productIds.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No rooms found in the selected categories.
            </div>
          )}
          {roomsLoading && (
            <div className="text-sm text-muted-foreground">
              Checking available rooms...
            </div>
          )}
          {roomsError && (
            <div className="text-sm text-destructive">{roomsError.message}</div>
          )}
          {!roomsLoading && shouldQuery && roomsDataList.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No rooms available for these dates.
            </div>
          )}
          {roomsDataList.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {roomsDataList.map((room: any) => (
                <div
                  key={room._id}
                  className="rounded-lg border border-border p-4"
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
                  <div className="font-semibold">{room.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {room.category?.name || "Uncategorized"}
                  </div>
                  {room.unitPrice && (
                    <div className="text-sm mt-2">
                      {Number(room.unitPrice).toLocaleString()} MNT
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRoom(room)}
                    >
                      View details
                    </Button>
                    <Button onClick={() => handleAddRoom(room, true)}>
                      Book now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <PageContent />
      <Dialog
        open={Boolean(selectedRoom)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRoom(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRoom?.name ?? "Room details"}</DialogTitle>
            <DialogDescription>
              {selectedRoom?.category?.name || "Room category"}
            </DialogDescription>
          </DialogHeader>
          {selectedRoom?.attachment?.url && (
            <div className="relative h-64 w-full overflow-hidden rounded-md">
              <Image
                src={getFileUrl(selectedRoom.attachment.url)}
                alt={selectedRoom?.name || "Room image"}
                fill
                className="object-cover"
              />
            </div>
          )}
          {selectedRoom?.description && (
            <p className="text-sm text-muted-foreground">
              {selectedRoom.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="text-lg font-semibold">
              {selectedRoom?.unitPrice
                ? `${Number(selectedRoom.unitPrice).toLocaleString()} MNT`
                : "Price on request"}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleAddRoom(selectedRoom)}
                disabled={isAdding}
              >
                Add to cart
              </Button>
              <Button
                onClick={() => handleAddRoom(selectedRoom, true)}
                disabled={isAdding}
              >
                Book & checkout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BookingPage = () => {
  const params = useParams<{ id: string }>();

  const { data: webDetailData } = useQuery(webQueries.webDetail, {
    variables: { id: params.id },
    skip: !params.id,
  });

  const templateType = webDetailData?.cpGetWebDetail?.templateType ?? "";

  if (templateType === "hotel") {
    return <HotelBookingPage />;
  }
  return <TourBookingForm />;
};

export default BookingPage;
