import { CP_GET_CONFIG } from "../graphql/queries";
import { getClient } from "./client";

export async function fetchCpConfig(webIdArg?: string) {
  const client = getClient();
  const webId = webIdArg || process.env.ERXES_WEB_ID;

  if (!webId) {
    console.error("[fetchCpConfig] Missing web ID", {
      providedWebId: webIdArg ?? null,
      envWebId: process.env.ERXES_WEB_ID ?? null,
    });
    return null;
  }

  try {
    const { data } = await client.query({
      query: CP_GET_CONFIG,
      variables: { _id: webId },
      context: {
        headers: {
          "x-app-token": process.env.ERXES_APP_TOKEN,
          "client-portal-id": webId,
        },
      },
    });

    return data.cpGetWebDetail;
  } catch (error) {
    const err = error as {
      message?: string;
      graphQLErrors?: Array<{
        message?: string;
        path?: ReadonlyArray<string | number>;
        extensions?: Record<string, unknown>;
      }>;
      networkError?: {
        message?: string;
        name?: string;
        result?: unknown;
        response?: {
          status?: number;
          statusText?: string;
        };
      };
    };

    console.error("[fetchCpConfig] Failed to fetch CP config", {
      webId,
      message: err.message ?? "Unknown error",
      graphQLErrors: err.graphQLErrors?.map((gqlError) => ({
        message: gqlError.message,
        path: gqlError.path,
        extensions: gqlError.extensions,
      })),
      networkError: err.networkError
        ? {
            name: err.networkError.name,
            message: err.networkError.message,
            status: err.networkError.response?.status,
            statusText: err.networkError.response?.statusText,
            result: err.networkError.result,
          }
        : null,
    });
    return null;
  }
}
