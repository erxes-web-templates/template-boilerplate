import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uncapitalize = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

export const getEnv = (): Record<string, string> => {
  if (typeof window === "undefined") return {};

  const envMaps: { name: string }[] = (window as any).envMaps || [];
  if (!envMaps.length) return {};

  const subdomain = window.location.hostname.split(".")[0];
  const envs: Record<string, string> = {};

  for (const envMap of envMaps) {
    const value = localStorage.getItem(`builder_env_${envMap.name}`) ?? "";
    envs[envMap.name] = value.replace("<subdomain>", subdomain);
  }

  return envs;
};

export const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (process.env.ERXES_FILE_URL) return `${process.env.ERXES_FILE_URL}${url}`;
  const env = getEnv();
  const apiDomain = env.NEXT_PUBLIC_API_DOMAIN || process.env.NEXT_PUBLIC_API_DOMAIN || "";
  return apiDomain ? `${apiDomain}/read-file?key=${url}` : url;
};

export const templateUrl = (slug: string) => {
  if (slug === "#") return "#";
  const normalized = slug.startsWith("/") ? slug : `/${slug}`;
  return normalized === "/home" ? "/" : normalized;
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
