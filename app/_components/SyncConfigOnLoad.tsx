"use client";

import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { CP_SYNC_CONFIG } from "../../graphql/mutations";

export default function SyncConfigOnLoad() {
  const [cpSyncConfig] = useMutation(CP_SYNC_CONFIG);

  useEffect(() => {
    cpSyncConfig({ variables: { type: "products" } });
  }, []);

  return null;
}
