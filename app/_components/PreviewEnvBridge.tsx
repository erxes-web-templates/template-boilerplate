"use client";

import { useEffect, useState } from "react";
// Relative, not "@/": the builder's tsconfig maps "@/" to its own src.
import { builderEnvPrefix } from "../../lib/utils";

type EnvMessage = {
  type: "erxes-builder-env";
  envs?: Record<string, string | null>;
  envMaps?: Array<{ name: string }>;
};

const MESSAGE_TYPE = "erxes-builder-env";
const READY_TYPE = "erxes-preview-ready";

/**
 * Carries the builder's environment across the iframe origin boundary.
 *
 * `getEnv()` reads `builder_env_*` out of localStorage, which is per-origin —
 * once the preview is served from the template's own host it can no longer see
 * what the builder stored. The builder posts its env map on load; we write it
 * into this origin's localStorage and re-render so consumers pick it up.
 */
export default function PreviewEnvBridge() {
  const [, setReceived] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    const handleMessage = (event: MessageEvent<EnvMessage>) => {
      if (event.data?.type !== MESSAGE_TYPE) return;

      const { envs, envMaps } = event.data;

      if (Array.isArray(envMaps)) {
        (window as unknown as { envMaps?: Array<{ name: string }> }).envMaps =
          envMaps;
      }

      let changed = false;

      if (envs) {
        const prefix = builderEnvPrefix();

        Object.entries(envs).forEach(([key, value]) => {
          try {
            const next = String(value ?? "");
            if (localStorage.getItem(`${prefix}${key}`) !== next) {
              localStorage.setItem(`${prefix}${key}`, next);
              changed = true;
            }
            // Drop the unprefixed copy an older build left behind. On a host
            // every tenant shares, that is some other project's API host and
            // tokens sitting in storage waiting to be read on a cold mount.
            if (prefix !== "builder_env_") {
              localStorage.removeItem(`builder_env_${key}`);
            }
          } catch {
            // Private browsing or blocked storage — fall back to process.env.
          }
        });
      }

      // Apollo has already fired the page queries by the time this arrives, and
      // it fired them with whatever env was available at mount — for a first
      // load, the template's own compiled-in defaults. Those responses are
      // cached, so simply re-rendering keeps showing the wrong (usually empty)
      // result. Reload once so every query re-runs against the builder's API
      // and token.
      //
      // This terminates: after the reload the values are already in
      // localStorage, so `changed` is false and no further reload happens.
      if (changed) {
        window.location.reload();
        return;
      }

      setReceived((count) => count + 1);
    };

    window.addEventListener("message", handleMessage);
    // Tell the builder we are mounted, so it knows when to post the env.
    window.parent.postMessage({ type: READY_TYPE }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}
