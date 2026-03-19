"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import { AuthProvider } from "./AuthContext";

// Create the Apollo Client instance
function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.ERXES_API_URL || "http://localhost:4000/graphql", // Your GraphQL API endpoint
    credentials: "include", // Include cookies
    headers: {
      "Access-Control-Allow-Origin": process.env.ERXES_URL || "", // CORS header
      "erxes-pos-token": process.env.NEXT_PUBLIC_POS_TOKEN || "",
    },
    fetchOptions: { cache: "no-store" }, // Disable caching for now
  });

  return new ApolloClient({
    cache: new InMemoryCache(), // Use InMemoryCache for client-side caching
    link: httpLink, // Use the HttpLink for client-side requests
  });
}

// ApolloWrapper component to provide the Apollo Client to the app
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  const client = makeClient(); // Create the Apollo Client instance

  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
