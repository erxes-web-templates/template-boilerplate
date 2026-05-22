import { clsx, type ClassValue } from "clsx";
// import { useParams } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { isBuildMode } from "./buildMode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uncapitalize = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

export const getEnv = (): any => {
  const envs: any = {};

  if (typeof window !== "undefined") {
    const appVersion =
      localStorage.getItem(`builder_env_NEXT_PUBLIC_APP_VERSION`) || "SAAS";

    const envMaps = (window as any).envMaps || [];

    if (appVersion === "SAAS") {
      const subdomain = window.location.hostname
        .replace(/(^\w+:|^)\/\//, "")
        .split(".")[0];

      for (const envMap of envMaps) {
        const value = localStorage.getItem(`builder_env_${envMap.name}`) ?? "";
        envs[envMap.name] = value.replace("<subdomain>", subdomain);
      }

      return envs;
    }

    for (const envMap of envMaps) {
      envs[envMap.name] = localStorage.getItem(`builder_env_${envMap.name}`);
    }
  }

  return envs;
};

export const getFileUrl = (url: string) => {
  if (!url) return "";
  if (!isBuildMode()) {
    return `${process.env.ERXES_FILE_URL}${url}`;
  }
  if (typeof window === "undefined") {
    return `${process.env.NEXT_PUBLIC_API_DOMAIN}/read-file?key=${url}`;
  }
  const env = getEnv();
  return `${env.NEXT_PUBLIC_API_DOMAIN}/read-file?key=${url}`;
};

export const templateUrl = (slug: string) => {
  if (!isBuildMode()) {
    if (slug === "#") {
      return "#";
    }

    if (/^https?:\/\//i.test(slug)) {
      return slug;
    }

    const normalized = slug.startsWith("/") ? slug : `/${slug}`;
    return normalized === "/home" ? "/" : normalized;
  }

  if (typeof window !== "undefined") {
    if (slug === "#") {
      return "#";
    } else if (/^https?:\/\//i.test(slug)) {
      return slug;
    } else {
      const url = new URL(window.location.href);
      const id = url.pathname.split("/").pop();

      const currentParams = new URLSearchParams(url.search);
      const templateId = currentParams.get("template");

      const newUrl = new URL(
        `/dashboard/projects/${id}`,
        window.location.origin
      );

      newUrl.searchParams.append("template", templateId || "");

      const sanitizedSlug = slug.replace(/^\//, "");

      if (sanitizedSlug === "") {
        newUrl.searchParams.append("pageName", "home");
      } else if (sanitizedSlug.includes("tours/")) {
        const tourId = sanitizedSlug.split("tours/")[1];
        newUrl.searchParams.append("pageName", "tour");
        newUrl.searchParams.append("tourId", tourId);
      } else if (sanitizedSlug.includes("rooms/")) {
        const roomId = sanitizedSlug.split("rooms/")[1];
        newUrl.searchParams.append("pageName", "room");
        newUrl.searchParams.append("roomId", roomId);
      } else {
        newUrl.searchParams.append("pageName", sanitizedSlug);
      }

      currentParams.forEach((value, key) => {
        if (key !== "template" && key !== "pageName" && key !== "tourId" && key !== "roomId") {
          newUrl.searchParams.append(key, value);
        }
      });

      return decodeURIComponent(
        newUrl.toString().replace(window.location.origin, "")
      );
    }
  }
  throw new Error("window is undefined");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSocialLinks(externalLinks: any) {
  const socials = {
    twitter: externalLinks.twitter,
    linkedin: externalLinks.linkedin,
    youtube: externalLinks.youtube,
    instagram: externalLinks.instagram,
    facebook: externalLinks.facebook,
    whatsapp: externalLinks.whatsapp,
  };

  // Filter out null values if desired
  const filteredSocials = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(socials).filter(([_, value]) => value !== null)
  );

  return filteredSocials;
}

// export const templateUrl = (projectId: string, slug: string) => {
//   return `/dashboard/projects/${projectId}?template=tour-boilerplate&pageName=${slug}`;
// };
