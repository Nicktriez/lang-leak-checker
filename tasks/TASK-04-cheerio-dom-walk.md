# Task 4 — `cheerio`, the DOM walk, and arrays

> **Rails analogy:** `cheerio` is Nokogiri, but with jQuery's selector API. The DOM is the "HTML parse tree" — think of it as Rails' own internal representation of a page, and `$("h1")` is like `doc.at_css('h1')` on steroids.

## What you'll learn
- What the DOM is and how cheerio represents it
- Selecting elements, iterating with `.each()`
- Building arrays with `.map()`
- The `Set` type (like a Ruby `Set`)
- Real interface usage for your `TextNode` schema

## Step 1 — Create `src/scan.ts`

```ts
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
```

## Read this — the concepts

### The DOM
When cheerio parses HTML, it builds a **tree** of nodes: `<html>` at the root, then `<head>`, `<body>`, and nested elements inside. `$("*")` selects **every element** in the tree. The `.each()` callback runs once per element, with `_i` (the index) and `el` (the element).

### `el as Element` — type casting / assertion
cheerio's `.each()` callback gives you a node that TS sees as a generic type. We **assert** it's an `Element` with `as Element` so we can read `.tagName`. The `as` keyword is TS saying "trust me, this is this type." Use it sparingly — it's you overriding the compiler. Here it's justified because we know cheerio's DOM nodes are elements.

### `?.` optional chaining and `??` nullish coalescing
- `tagName?.toLowerCase()` — "if `tagName` exists, call `.toLowerCase()`, otherwise give me `undefined`." Stops the crash you'd get in Ruby from `nil.to_lowercase`.
- `?? ""` — "if the left side is `null`/`undefined`, use `""` instead." Ruby's `nil || ""` essentially.
- Together: `(el as Element).tagName?.toLowerCase() ?? ""` = "safely get the tag name, defaulting to empty string."

> These two operators (`?.` and `??`) are TS/JS's answer to "defensive nil-handling." You'll use them constantly. They exist precisely because `strict` mode forces you to think about values being `undefined`.

### `new Set([...])` — the `Set` type
`HIDDEN_TAGS` is a `Set<string>` — like a Ruby `Set`. `.has(tag)` is an O(1) membership check, cleaner than `.includes()` on an array. It reads well: `if HIDDEN_TAGS.has(tag) → skip this hidden tag`.

### `.push` building an array incrementally
`const out: TextNode[] = []` declares an empty array of `TextNode`. Inside `.each()` we `out.push({...})`. This is the imperative way. The `out` variable is typed — TS knows it's `TextNode[]`, so pushing an object missing `text` would error.

## Step 2 — Test it manually

Add a temporary debug line in `cli.ts` after `loadHtml`:

```ts
import { scanPage } from "./scan.js";
const nodes = scanPage(html, { includeHidden: false, includeMeta: false });
console.log(nodes.slice(0, 5));
```

Run against the homepage:
```bash
npm run dev -- --language da https://beta.skujeg.dk/
```
You'll see an array of `{ elementPath, text }` objects — the visible text of each element, with a path that identifies where it lives. **This is the raw material the language detector will consume.**

## Check you understand
- [ ] I can explain what the DOM is and what `$("*")` returns.
- [ ] I can explain `as Element` (type assertion) and `?.` / `??` (safe nil-handling).
- [ ] I can explain why `HIDDEN_TAGS` is a `Set` and what `.has()` does.
- [ ] I saw the array of `TextNode` objects in the terminal.
