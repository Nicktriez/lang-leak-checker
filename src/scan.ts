import { load } from "cheerio";
import type { Element } from "domhandler";

export interface TextNode {
  elementPath: string; // e.g. "h1", "div#main", "p.leak"
  text: string;
}

const HIDDEN_TAGS = new Set(["script", "style", "noscript", "svg"]);
const HEAD_TEXT_TAGS = new Set(["title", "meta"]);

export function scanPage(
  raw: string,
  opts: { includeHidden: boolean; includeMeta: boolean }
): TextNode[] {
  const $ = load(raw);
  const out: TextNode[] = [];

  $("*").each((_i, el) => {
    const tag = (el as Element).tagName?.toLowerCase() ?? "";
    if (tag === "html" || tag === "head" || tag === "body") return;

    if (!opts.includeHidden && HIDDEN_TAGS.has(tag)) return;
    if (!opts.includeMeta && HEAD_TEXT_TAGS.has(tag)) return;

    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;

    out.push({ elementPath: buildPath($, el), text });
  });

  return out;
}

function buildPath($: ReturnType<typeof load>, el: unknown): string {
  const $el = $(el as Element);
  const id = $el.attr("id");
  const classes = ($el.attr("class") ?? "").trim().split(/\s+/).filter(Boolean);
  const tag = (el as Element).tagName?.toLowerCase() ?? "";
  return tag + (id ? `#${id}` : "") + (classes.length ? `.${classes.join(".")}` : "");
}
