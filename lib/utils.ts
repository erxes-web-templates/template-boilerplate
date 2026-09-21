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

/** Values baked in at template build time, used when localStorage is empty. */
const processEnvFallbacks = (): Record<string, string> => {
  const fallbacks: Record<string, string> = {};
  const put = (key: string, value?: string) => {
    if (value) fallbacks[key] = value;
  };

  put("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_ERXES_API_URL);
  put("NEXT_PUBLIC_API_DOMAIN", process.env.NEXT_PUBLIC_API_DOMAIN);
  put("NEXT_PUBLIC_POS_TOKEN", process.env.NEXT_PUBLIC_POS_TOKEN);
  put("NEXT_PUBLIC_ERXES_APP_TOKEN", process.env.NEXT_PUBLIC_ERXES_APP_TOKEN);
  put("NEXT_PUBLIC_ERXES_CP_ID", process.env.NEXT_PUBLIC_ERXES_CP_ID);

  if (!fallbacks.NEXT_PUBLIC_API_URL) {
    fallbacks.NEXT_PUBLIC_API_URL = "http://localhost:4000/graphql";
  }
  if (!fallbacks.NEXT_PUBLIC_API_DOMAIN) {
    fallbacks.NEXT_PUBLIC_API_DOMAIN = new URL(
      fallbacks.NEXT_PUBLIC_API_URL,
    ).origin;
  }

  return fallbacks;
};

/**
 * localStorage prefix for the builder env on this origin.
 *
 * One preview host serves every tenant, and localStorage is per-origin — so
 * unprefixed `builder_env_*` keys let whichever project loaded last hand its
 * API host and tokens to the next one. Scoping them to the project id from the
 * preview path keeps each project reading only what its own builder posted.
 *
 * Off the preview route — a deployed site — nothing writes these keys at all,
 * so the unprefixed fallback is only ever reached by legacy storage.
 */
export const builderEnvPrefix = (): string => {
  if (typeof window === "undefined") return "builder_env_";

  const match = /\/dashboard\/projects\/([^/?#]+)/.exec(
    window.location.pathname,
  );

  return match ? `builder_env_${match[1]}_` : "builder_env_";
};

/**
 * Every builder env key stored for this project on this origin.
 *
 * The envMaps-driven lookup below only sees keys the builder happened to
 * advertise on `window.envMaps`, and in the builder preview that list does not
 * survive a page reload — it is set by a postMessage, not persisted. Reading
 * the stored keys directly means a reloaded preview still resolves the API URL
 * and tokens the builder gave it, instead of silently dropping back to the
 * template's compiled-in defaults.
 *
 * Values arrive already resolved. `<subdomain>` is substituted by the builder,
 * against the builder's own hostname; doing it here would resolve the preview
 * host instead — "nocturne" rather than the tenant — and point every query at a
 * client portal that does not exist.
 */
const storedBuilderEnv = (): Record<string, string> => {
  const stored: Record<string, string> = {};
  if (typeof window === "undefined") return stored;

  const prefix = builderEnvPrefix();

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const value = localStorage.getItem(key);
      if (value) stored[key.slice(prefix.length)] = value;
    }
  } catch {
    // Blocked storage — process.env fallbacks still apply.
  }

  return stored;
};

export const getEnv = (): any => {
  const envs: any = { ...processEnvFallbacks(), ...storedBuilderEnv() };

  if (typeof window === "undefined") return envs;

  const prefix = builderEnvPrefix();
  const envMaps = (window as any).envMaps || [];

  try {
    for (const envMap of envMaps) {
      const value = localStorage.getItem(`${prefix}${envMap.name}`);
      if (value) envs[envMap.name] = value;
    }
  } catch {
    // Blocked storage — storedBuilderEnv() and process.env already applied.
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

/** Returns the minimum price across all pricingOptions entries, or null if none. */
export function getMinTourPrice(
  pricingOptions?: Array<{ prices?: Array<{ price: number; type: string }> }> | null,
): number | null {
  const allPrices = pricingOptions?.flatMap((po) => po.prices ?? []) ?? [];
  if (!allPrices.length) return null;
  return Math.min(...allPrices.map((p) => p.price));
}

// export const templateUrl = (projectId: string, slug: string) => {
//   return `/dashboard/projects/${projectId}?template=tour-boilerplate&pageName=${slug}`;
// };

/**
 * The client portal's own app token, fetched the way the web builder fetches
 * it.
 *
 * `cpWebPage` and friends scope their query by `clientPortal._id`, which the
 * API decodes from the `x-app-token` JWT. A template ships with a token for
 * whatever portal it was built against — the boilerplate's demo portal — so a
 * preview using that token queries the wrong portal and gets nothing back,
 * which is what "No contents available" means in the builder preview.
 *
 * The builder resolves this by reading `cpId` from its URL and asking the API
 * for that portal's token. The preview URL carries `cpId` through, so the
 * template can do exactly the same rather than have a staff credential handed
 * to it over postMessage.
 */
const cpTokenCache: Record<string, string> = {};

export const getCpToken = async (): Promise<string> => {
  if (typeof window === "undefined") return "";

  const cpId = new URLSearchParams(window.location.search).get("cpId");
  if (!cpId) return "";
  if (cpTokenCache[cpId]) return cpTokenCache[cpId];

  const env = getEnv();
  const apiUrl = env.NEXT_PUBLIC_API_URL
    ? String(env.NEXT_PUBLIC_API_URL)
    : `${env.NEXT_PUBLIC_API_DOMAIN ?? ""}/graphql`;
  if (!apiUrl || apiUrl === "/graphql") return "";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query:
          "query GetClientPortal($id: String!) { getClientPortal(_id: $id) { token } }",
        variables: { id: cpId },
      }),
    });

    const json = await response.json();
    const token = json?.data?.getClientPortal?.token;
    if (token) cpTokenCache[cpId] = token;
    return token || "";
  } catch {
    return "";
  }
};
