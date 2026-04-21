import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uncapitalize = (str: string) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};

export const getFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${process.env.ERXES_FILE_URL}${url}`;
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
