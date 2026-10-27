import { GET_WEB_PAGE } from "../graphql/queries";
import { getClient } from "./client";

/**
 * Server-side fetch for a web page's pageItems.
 * Uses Next.js ISR via the revalidate option set in lib/client.ts.
 * Call this from async Server Components in production mode.
 */
export async function fetchWebPage(webId: string, slug: string) {
  const client = getClient();

  try {
    const { data } = await client.query({
      query: GET_WEB_PAGE,
      variables: { webId, slug },
    });

    return data?.cpWebPage ?? null;
  } catch (error) {
    console.error("Error fetching web page:", error);
    return null;
  }
}
