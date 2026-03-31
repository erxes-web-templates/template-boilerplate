"use client";

import { useQuery } from "@apollo/client";
import { CP_GET_CONFIG } from "../graphql/queries";

const useClientPortal = ({ id }: { id: string }) => {
  const { data, loading, error } = useQuery(CP_GET_CONFIG, {
    variables: { _id: id },
    skip: !id,
  });

  const cpDetail = data?.cpGetWebDetail || {};

  return { cpDetail, loading, error, id };
};

export default useClientPortal;
