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
        "x-app-token": process.env.ERXES_APP_TOKEN || "",
      },
      fetchOptions: {
        next: { revalidate: 60 },
      },
    }),
  });

export const getClient = (): ApolloClient<NormalizedCacheObject> =>
  createClient();
