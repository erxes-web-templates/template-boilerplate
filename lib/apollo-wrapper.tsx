"use client";

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloProvider } from "@apollo/client";
import { useRef } from "react";
import { AuthProvider } from "./AuthContext";
import { getCpToken, getEnv } from "./utils";

// Create the Apollo Client instance
/**
 * Where this client talks to, and as whom.
 *
 * Resolved per request rather than baked in at client construction, because in
 * the web builder's preview the template is served from its own origin and
 * receives the builder's env over postMessage *after* mount (see
 * `app/_components/PreviewEnvBridge.tsx`). Reading `process.env` once at
 * construction meant the preview always used the template's own compiled-in
 * defaults — a hardcoded app token for the boilerplate's demo portal — so
 * queries scoped to the portal, `cpWebPage` among them, came back empty and
 * the preview rendered "No contents available" no matter what the builder was
 * pointed at.
 *
 * Builder env keys come from `envMaps` in the builder's ApolloProvider:
 * NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CP_TOKEN, NEXT_PUBLIC_POS_TOKEN, …
 * `process.env` stays the fallback for a normally deployed site.
 */
const resolveApiUrl = (): string => {
  const env = getEnv();
  return (
    env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_ERXES_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/graphql"
  );
};

const resolveAppToken = (): string => {
  const env = getEnv();
  return (
    env.NEXT_PUBLIC_CP_TOKEN ||
    env.NEXT_PUBLIC_ERXES_APP_TOKEN ||
    process.env.NEXT_PUBLIC_ERXES_APP_TOKEN ||
    ""
  );
};

const resolvePosToken = (): string => {
  const env = getEnv();
  return env.NEXT_PUBLIC_POS_TOKEN || process.env.NEXT_PUBLIC_POS_TOKEN || "";
};

function makeClient() {
  const httpLink = new HttpLink({
    // A function, so the endpoint is re-read once the builder's env lands.
    uri: () => resolveApiUrl(),
    credentials: "include",
    fetchOptions: { cache: "no-store" },
  });

  // Safari blocks cross-site cookies (ITP), so we read the token from
  // sessionStorage (set after login) and send it as a header instead.
  // The erxes gateway reads `client-auth-token` from headers OR cookies.
  const authLink = setContext(async (_, { headers }) => {
    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

    // In the builder preview the URL carries `cpId`, so we can fetch the
    // portal's real token exactly as the builder does. Without it we would
    // query as whatever portal this template was compiled against.
    const fetchedCpToken = await getCpToken();

    // Tokens go here rather than on the HttpLink so they are read fresh on
    // every request, once the preview env bridge has delivered them.
    const appToken = fetchedCpToken || resolveAppToken();
    const posToken = resolvePosToken();
    const cpId =
      getEnv().NEXT_PUBLIC_ERXES_CP_ID || process.env.NEXT_PUBLIC_ERXES_CP_ID;

    return {
      headers: {
        ...headers,
        ...(posToken ? { "erxes-pos-token": posToken } : {}),
        ...(appToken ? { "x-app-token": appToken } : {}),
        ...(token ? { "client-auth-token": token } : {}),
        ...(cpId ? { "client-portal-id": cpId } : {}),
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([authLink, httpLink]),
  });
}

// ApolloWrapper component to provide the Apollo Client to the app
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  const clientRef = useRef<ReturnType<typeof makeClient> | null>(null);
  if (!clientRef.current) {
    clientRef.current = makeClient();
  }

  return (
    <ApolloProvider client={clientRef.current}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
