export type BuildMode = "build" | "production";

export const getBuildMode = (): BuildMode => {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_BUILD_MODE as BuildMode) || "production";
  }

  return (
    (process.env.BUILD_MODE as BuildMode) ||
    (process.env.NEXT_PUBLIC_BUILD_MODE as BuildMode) ||
    "production"
  );
};

export const isBuildMode = () => getBuildMode() === "build";
