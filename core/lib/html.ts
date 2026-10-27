export type HtmlValue = string | { __html?: string | null } | null | undefined;

export const toHtml = (value: HtmlValue) => {
  if (value && typeof value === "object" && "__html" in value) {
    return { __html: String(value.__html ?? "") };
  }

  return { __html: String(value ?? "") };
};
