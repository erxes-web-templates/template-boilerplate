import path from "path";
import type { NextConfig } from "next";

export function createNextConfig(env: NextConfig["env"]): NextConfig {
  return {
    env,
    images: {
      unoptimized: true,
    },
    webpack: (config) => {
      config.resolve.alias["@"] = path.resolve(process.cwd());
      return config;
    },
  };
}
