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

// Create the Apollo Client instance
function makeClient() {
  const httpLink = new HttpLink({
    uri:
      process.env.NEXT_PUBLIC_ERXES_API_URL || "http://localhost:4000/graphql",
    credentials: "include",
    headers: {
      "erxes-pos-token": process.env.NEXT_PUBLIC_POS_TOKEN || "",
      "x-app-token": process.env.ERXES_APP_TOKEN || "",
    },
    fetchOptions: { cache: "no-store" },
  });

  // Safari blocks cross-site cookies (ITP), so we read the token from
  // sessionStorage (set after login) and send it as a header instead.
  // The erxes gateway reads `client-auth-token` from headers OR cookies.
  const authLink = setContext((_, { headers }) => {
    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

    return {
      headers: {
        ...headers,
        ...(token ? { "client-auth-token": token } : {}),
        ...(process.env.NEXT_PUBLIC_ERXES_CP_ID
          ? { "client-portal-id": process.env.NEXT_PUBLIC_ERXES_CP_ID }
          : {}),
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
