"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { gql, useQuery } from "@apollo/client";
import PageLoader from "../components/common/PageLoader";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  erxesCustomerId: string;
  erxesCompanyId: string;
}

interface AuthContextType {
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CP_CURRENT_USER = gql`
  query clientPortalCurrentUser {
    clientPortalCurrentUser {
      _id
      firstName
      lastName
      email
      phone
      avatar
      erxesCustomerId
      erxesCompanyId
    }
  }
`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, loading } = useQuery(CP_CURRENT_USER, {
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
  });

  const user: User | null = data?.clientPortalCurrentUser ?? null;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
