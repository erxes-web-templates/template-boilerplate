import { getEnv } from "./utils";

/**
 * Upload a file to erxes.
 *
 * The gateway serves uploads from the same origin as GraphQL, at
 * `/upload-file` (multipart, field name "file"). It answers with either an
 * absolute URL or a bare storage key — `getFileUrl()` handles reading both
 * back, so store whatever comes out of here verbatim on the record.
 *
 * The boilerplate previously had no way to upload at all; `getFileUrl` only
 * ever read files back. Ticket attachments are the first thing that needs it.
 */

export type UploadedFile = {
  url: string;
  name: string;
  type?: string;
  size?: number;
};

export const getUploadUrl = (): string => {
  const env = getEnv();
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_API_URL || "";
  const domain =
    process.env.NEXT_PUBLIC_API_DOMAIN || env.NEXT_PUBLIC_API_DOMAIN || "";

  if (domain) return `${domain.replace(/\/+$/, "")}/upload-file`;
  // Fall back to deriving it from the GraphQL endpoint.
  return apiUrl.replace(/\/graphql\/?$/, "/upload-file");
};

export class UploadError extends Error {}

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  const endpoint = getUploadUrl();
  if (!endpoint) {
    throw new UploadError("No API host is configured for uploads.");
  }

  const body = new FormData();
  body.append("file", file);

  const response = await fetch(endpoint, {
    method: "POST",
    body,
    // erxes reads the portal session from the cookie when there is one.
    credentials: "include",
  });

  if (!response.ok) {
    throw new UploadError(
      `Upload failed (${response.status}). The file was not attached.`,
    );
  }

  // The endpoint answers with a plain-text URL or storage key, not JSON.
  const value = (await response.text()).trim();
  if (!value) throw new UploadError("Upload returned an empty response.");

  return { url: value, name: file.name, type: file.type, size: file.size };
};
