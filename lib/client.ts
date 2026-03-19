import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client";

const createClient = () =>
  new ApolloClient({
    ssrMode: typeof window === "undefined",
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.ERXES_API_URL || "http://localhost:4000/graphql",
      credentials: "include",
      headers: {
        "Access-Control-Allow-Origin": process.env.ERXES_URL || "",
        "x-app-token": process.env.ERXES_APP_TOKEN || "",
      },
      fetchOptions: {
        // Use Next.js caching with 1 hour revalidation instead of no-store
        // This allows static rendering while keeping data reasonably fresh
        next: { revalidate: 3600 },
      },
    }),
  });

export const getClient = (): ApolloClient<NormalizedCacheObject> =>
  createClient();
