import { load } from "cheerio";
const HIDDEN_TAGS = new Set(["script", "style", "noscript", "svg"]);
const HEAD_TEXT_TAGS = new Set(["title", "meta"]);
export function scanPage(raw, opts) {
    const $ = load(raw);
    const out = [];
    $("*").each((_i, el) => {
        const tag = el.tagName?.toLowerCase() ?? "";
        if (tag === "html" || tag === "head" || tag === "body")
            return;
        if (!opts.includeHidden && HIDDEN_TAGS.has(tag))
            return;
        if (!opts.includeMeta && HEAD_TEXT_TAGS.has(tag))
            return;
        const text = $(el).text().replace(/\s+/g, " ").trim();
        if (!text)
            return;
        out.push({ elementPath: buildPath($, el), text });
    });
    return out;
}
function buildPath($, el) {
    const $el = $(el);
    const id = $el.attr("id");
    const classes = ($el.attr("class") ?? "").trim().split(/\s+/).filter(Boolean);
    const tag = el.tagName?.toLowerCase() ?? "";
    return tag + (id ? `#${id}` : "") + (classes.length ? `.${classes.join(".")}` : "");
}
