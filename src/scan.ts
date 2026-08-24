import { load } from "cheerio";
import { isTag, type Element } from "domhandler";

export interface TextNode {
  elementPath: string; // e.g. "h1", "div#main", "p.leak"
  text: string;
}

// Not rendered: scripts/styles/svg, plus <template> blocks (invisible
// hydration fragments — elementText doesn't descend into their .content).
const HIDDEN_TAGS = new Set(["script", "style", "noscript", "svg", "template"]);
const HEAD_TEXT_TAGS = new Set(["title", "meta"]);

export function scanPage(
  raw: string,
  opts: { includeHidden: boolean; includeMeta: boolean; excludeSelectors?: string[] }
): TextNode[] {
  const $ = load(raw);
  const out: TextNode[] = [];

  $("*").each((_i, el) => {
    if (!isTag(el)) return;

    const tag = el.tagName.toLowerCase();
    if (tag === "html" || tag === "head" || tag === "body") return;

    if (!opts.includeHidden && HIDDEN_TAGS.has(tag)) return;
    if (!opts.includeMeta && HEAD_TEXT_TAGS.has(tag)) return;
    // Exclude the element and its whole subtree (closest matches self or an ancestor).
    if (opts.excludeSelectors?.some((sel) => $(el).closest(sel).length > 0)) return;

    const text = elementText(el);
    if (!text) return;

    out.push({ elementPath: buildPath($, el), text });
  });

  return out;
}

/**
 * Concatenates descendant text with a space between element boundaries, so
 * nested markup yields real word boundaries ("Leaderboard Points for…",
 * not "LeaderboardPoints…") for the language detector.
 */
function elementText(el: Element): string {
  const parts: string[] = [];
  for (const child of el.children) {
    if (child.type === "text") parts.push(child.data);
    else if (isTag(child)) parts.push(elementText(child));
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function buildPath($: ReturnType<typeof load>, el: Element): string {
  const $el = $(el);
  const id = $el.attr("id");
  const classes = ($el.attr("class") ?? "").trim().split(/\s+/).filter(Boolean);
  return el.tagName.toLowerCase() + (id ? `#${id}` : "") + (classes.length ? `.${classes.join(".")}` : "");
}
