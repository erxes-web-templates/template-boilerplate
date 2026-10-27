import { getClient } from "./client";
import { queries as roomQueries } from "../graphql/pms/rooms";
import type { RoomSummary, RoomTag } from "../graphql/pms/rooms";

const ctxHeaders = {
  "client-portal-id": process.env.ERXES_CP_ID,
  "x-app-token": process.env.ERXES_APP_TOKEN,
};

async function fetchAccommodationTagId(): Promise<string | undefined> {
  const client = getClient();
  try {
    const { data } = await client.query<{ cpTags: RoomTag[] }>({
      query: roomQueries.cpTags,
      variables: { searchValue: "accommodation", type: "core:product" },
      context: { headers: ctxHeaders },
    });
    return data.cpTags?.[0]?._id;
  } catch {
    return undefined;
  }
}

export async function fetchRooms(perPage: number = 12, page: number = 1) {
  const client = getClient();
  const tagId = await fetchAccommodationTagId();

  try {
    const { data } = await client.query<{ cpProducts: RoomSummary[] }>({
      query: roomQueries.cpProducts,
      variables: {
        perPage,
        page,
        sortField: "createdAt",
        sortDirection: -1,
        ...(tagId ? { tagIds: [tagId] } : {}),
      },
      context: { headers: ctxHeaders },
    });

    return data.cpProducts ?? [];
  } catch (error) {
    console.error("[Rooms] Error fetching rooms:", error);
    return [];
  }
}

export async function fetchRoomDetail(id: string) {
  const client = getClient();
  const tagId = await fetchAccommodationTagId();

  try {
    const { data } = await client.query<{ cpProducts: RoomSummary[] }>({
      query: roomQueries.cpProducts,
      variables: {
        ids: [id],
        perPage: 1,
        page: 1,
        ...(tagId ? { tagIds: [tagId] } : {}),
      },
      context: { headers: ctxHeaders },
    });

    return data.cpProducts?.[0] ?? null;
  } catch {
    return null;
  }
}
