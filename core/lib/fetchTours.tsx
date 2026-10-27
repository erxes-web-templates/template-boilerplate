import {
  TOUR_DETAIL_QUERY,
  TOUR_GROUP_DETAIL_QUERY,
  TOURS_GROUP_QUERY,
  TOURS_QUERY,
} from "../graphql/queries";
import { getClient } from "./client";
import {
  BmTourDetail,
  BmTourDetailVariables,
  BmTourGroupDetailVariables,
  BmToursData,
  BmToursGroupVariables,
} from "../types/tours";

export async function fetchBmTours(limit: number, config?: any) {
  const client = getClient();

  console.log(
    `[BM Tours] Request params - limit: ${limit}, config:`,
    JSON.stringify(config),
  );

  try {
    const { data, error } = await client.query<{
      cpBmToursGroup: BmToursData;
    }>({
      query: TOURS_GROUP_QUERY,
      variables: { limit, ...config },
      context: {
        headers: {
          "x-app-token": process.env.ERXES_APP_TOKEN,
        },
      },
    });

    console.log(data.cpBmToursGroup, "data", error, "error---------------");

    return data.cpBmToursGroup;
  } catch (error) {
    console.error("[BM Tours] Error fetching data:", error);

    // Log more detailed error information
    if ((error as any).graphQLErrors) {
      console.error(
        "[BM Tours] GraphQL errors:",
        JSON.stringify((error as any).graphQLErrors),
      );
    }
    if ((error as any).networkError) {
      console.error(
        "[BM Tours] Network error details:",
        (error as any).networkError,
      );
      // For 400 errors, the response might contain more information
      if ((error as any).networkError.result) {
        console.error(
          "[BM Tours] Error response:",
          JSON.stringify((error as any).networkError.result),
        );
      }
    }

    return { totalCount: 0, list: [] };
  }
}

export async function fetchBmTourDetail(id: string) {
  const client = getClient();

  try {
    const { data } = await client.query<
      { cpBmToursGroupDetail: BmTourDetail },
      BmTourGroupDetailVariables
    >({
      query: TOUR_GROUP_DETAIL_QUERY,
      variables: { groupCode: id, status: "published" },
      context: {
        headers: {
          "x-app-token": process.env.ERXES_APP_TOKEN,
        },
      },
    });
    console.log(data, "daaaaaaaaaa");

    return data.cpBmToursGroupDetail;
  } catch (error) {
    console.error("Error fetching BM Tour Detail:", error);
    return null;
  }
}

export async function fetchBmToursGroup(limit: number) {
  const client = getClient();

  try {
    const { data } = await client.query<
      { cpBmToursGroup: { list: BmTourDetail[] } },
      BmToursGroupVariables
    >({
      query: TOURS_GROUP_QUERY,
      variables: { status: "published", limit },
      context: {
        headers: {
          "x-app-token": process.env.ERXES_APP_TOKEN,
        },
      },
    });

    return data.cpBmToursGroup.list;
  } catch (error) {
    console.error("Error fetching BM Tour Detail:", error);
    return null;
  }
}

export async function fetchBmToursGroupDetail(groupCode: string) {
  const client = getClient();

  try {
    const { data } = await client.query<
      { cpBmToursGroupDetail: BmTourDetail[] },
      BmTourGroupDetailVariables
    >({
      query: TOUR_GROUP_DETAIL_QUERY,
      variables: { groupCode, status: "published" },
      context: {
        headers: {
          "x-app-token": process.env.ERXES_APP_TOKEN,
        },
      },
    });

    return data.cpBmToursGroupDetail;
  } catch (error) {
    console.error("Error fetching BM Tours Group Detail:", error);
    return null;
  }
}
