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

export const isBuildMode = () => {
  if (typeof window !== "undefined") {
    return (
      window.location.pathname.includes("/dashboard/projects/") ||
      getBuildMode() === "build"
    );
  }
  return getBuildMode() === "build";
};
