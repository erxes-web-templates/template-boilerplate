import { CP_GET_CONFIG } from "../graphql/queries";
import { getClient } from "./client";

export async function fetchCpConfig() {
  const client = getClient();
  const webId = process.env.ERXES_WEB_ID || "";
  try {
    const { data } = await client.query({
      query: CP_GET_CONFIG,
      variables: { _id: webId },
    });

    return data.cpGetWebDetail;
  } catch (error) {
    console.error("Error fetching CP Config:", error);
    return null;
  }
}
