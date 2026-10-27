type InlineStyles = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  textColor?: string;
  backgroundColor?: string;
};

type InlineContent =
  | { type: "text"; text: string; styles: InlineStyles }
  | { type: "link"; href: string; content: Array<{ type: "text"; text: string; styles: InlineStyles }> };

type BlockProps = {
  textColor?: string;
  backgroundColor?: string;
  textAlignment?: string;
  level?: number;
  language?: string;
  url?: string;
  caption?: string;
  width?: number;
};

type Block = {
  id?: string;
  type: string;
  props?: BlockProps;
  content?: InlineContent[];
  children?: Block[];
};

function renderInline(content: InlineContent[]): string {
  return content
    .map((node) => {
      if (node.type === "link") {
        const inner = renderInline(node.content ?? []);
        return `<a href="${escapeHtml(node.href)}" target="_blank" rel="noopener noreferrer" class="underline text-primary">${inner}</a>`;
      }

      let text = escapeHtml(node.text);
      if (!text) return "";

      const { bold, italic, underline, strikethrough, code, textColor } =
        node.styles ?? {};

      if (code) text = `<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">${text}</code>`;
      if (bold) text = `<strong>${text}</strong>`;
      if (italic) text = `<em>${text}</em>`;
      if (underline) text = `<u>${text}</u>`;
      if (strikethrough) text = `<s>${text}</s>`;
      if (textColor && textColor !== "default")
        text = `<span style="color:${escapeHtml(textColor)}">${text}</span>`;

      return text;
    })
    .join("");
}

function alignClass(props?: BlockProps): string {
  switch (props?.textAlignment) {
    case "center":
      return " text-center";
    case "right":
      return " text-right";
    case "justify":
      return " text-justify";
    default:
      return "";
  }
}

function renderBlock(block: Block): string {
  const inner = renderInline(block.content ?? []);
  const children = (block.children ?? []).map(renderBlock).join("");
  const align = alignClass(block.props);

  switch (block.type) {
    case "paragraph":
      return inner || children
        ? `<p class="mb-3${align}">${inner}${children}</p>`
        : "";

    case "heading": {
      const level = block.props?.level ?? 2;
      const tag = `h${Math.min(Math.max(level, 1), 6)}`;
      const cls =
        level === 1
          ? "text-2xl font-bold mb-4"
          : level === 2
          ? "text-xl font-semibold mb-3"
          : "text-lg font-semibold mb-2";
      return `<${tag} class="${cls}${align}">${inner}</${tag}>`;
    }

    case "bulletListItem":
      return `<li class="mb-1 ml-5 list-disc${align}">${inner}${
        children ? `<ul class="mt-1">${children}</ul>` : ""
      }</li>`;

    case "numberedListItem":
      return `<li class="mb-1 ml-5 list-decimal${align}">${inner}${
        children ? `<ol class="mt-1">${children}</ol>` : ""
      }</li>`;

    case "checkListItem": {
      const checked = (block.props as any)?.checked ? "checked" : "";
      return `<li class="mb-1 flex items-start gap-2"><input type="checkbox" ${checked} disabled class="mt-0.5" /><span>${inner}</span></li>`;
    }

    case "quote":
      return `<blockquote class="border-l-4 border-border pl-4 italic text-muted-foreground mb-3${align}">${inner}</blockquote>`;

    case "codeBlock": {
      const lang = block.props?.language ?? "";
      return `<pre class="rounded-md bg-muted p-4 overflow-x-auto mb-3"><code class="text-sm font-mono"${lang ? ` data-language="${escapeHtml(lang)}"` : ""}>${inner}</code></pre>`;
    }

    case "image": {
      const url = block.props?.url;
      const caption = block.props?.caption;
      if (!url) return "";
      return `<figure class="mb-4"><img src="${escapeHtml(url)}" alt="${escapeHtml(caption ?? "")}" class="max-w-full rounded-md" />${
        caption ? `<figcaption class="mt-1 text-xs text-muted-foreground">${escapeHtml(caption)}</figcaption>` : ""
      }</figure>`;
    }

    default:
      return inner ? `<div class="mb-2${align}">${inner}</div>` : "";
  }
}

function groupListItems(blocks: Block[]): string {
  let result = "";
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === "bulletListItem") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "bulletListItem") {
        items.push(renderBlock(blocks[i]));
        i++;
      }
      result += `<ul class="mb-3 space-y-1">${items.join("")}</ul>`;
    } else if (block.type === "numberedListItem") {
      const items: string[] = [];
      while (i < blocks.length && blocks[i].type === "numberedListItem") {
        items.push(renderBlock(blocks[i]));
        i++;
      }
      result += `<ol class="mb-3 space-y-1">${items.join("")}</ol>`;
    } else {
      result += renderBlock(block);
      i++;
    }
  }
  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function blockNoteToPlainText(value: string | null | undefined): string {
  if (!value) return "";
  let blocks: Block[];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return value;
    blocks = parsed;
  } catch {
    return value;
  }
  return blocks
    .map((block) =>
      (block.content ?? [])
        .map((node) => {
          if (node.type === "text") return node.text;
          if (node.type === "link")
            return node.content.map((n) => n.text).join("");
          return "";
        })
        .join(""),
    )
    .filter(Boolean)
    .join("\n");
}

export function blockNoteToHtml(value: string | null | undefined): string {
  if (!value) return "";

  let blocks: Block[];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return value;
    blocks = parsed;
  } catch {
    return value;
  }

  return groupListItems(blocks);
}
