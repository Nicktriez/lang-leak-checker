# Task 3 — Async, `fetch`, and loading HTML

> **Rails analogy:** This is like a `Net::HTTP` request, but `async/await` is Ruby's `Async` or how your Rails app handles I/O concurrently — except in JS, `async/await` is the *default* style, not an edge feature.

## What you'll learn
- `async`/`await` and `Promise` — the JS way of handling things that take time
- `fetch` — the built-in HTTP client (Rails has no one built-in; this is Node's)
- Union types (`string | ...`) and discriminated branching
- `throws` and typed error handling

## Step 1 — Create `src/fetch.ts`

```ts
import { readFile } from "node:fs/promises";

export async function loadHtml(input: string): Promise<string> {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    const resp = await fetch(input, {
      headers: { "user-agent": "lang-leak-checker/0.1" },
    });
    if (!resp.ok) {
      throw new Error(`fetch failed for ${input}: HTTP ${resp.status}`);
    }
    return await resp.text();
  }
  return await readFile(input, "utf-8");
}
```

## Read this — the concepts

### `async` / `await` / `Promise`

This is the single hardest concept in the whole course, so slow down here.

Think about a network request: you ask a website for its HTML, and the answer takes time to arrive. In Ruby, this is like an `Async` block or a background job — work that completes *later*. In JavaScript, *any* work that takes time (network, reading a file) is modeled the same way, and it's the default style, not a special case.

- **A `Promise<string>` is a "string that will arrive later."** It's a *receipt* for a value that doesn't exist yet. The moment you make the request, you get a Promise immediately — but the actual string inside it isn't there until the network answers.
- **`async function`** = a function that *returns a Promise*. Because the function's body does slow work (fetch, file read), TS knows it can't return the value instantly — so its return type is `Promise<string>`, not `string`.
- **`await`** = "pause here until this Promise resolves, then give me the actual value." Code after `await` runs only once the value has arrived.
- **You can only use `await` inside an `async` function.** This is the rule you'll trip over constantly — the error "await is only valid in async function" means you used `await` somewhere that isn't `async`.

> **Ruby mental model:** `Promise<string>` ≈ a future/job that will hold a string. `await` ≈ blocking until the job completes and grabbing its result. The difference from Ruby: in JS this is everywhere, not opt-in.

### Union types — "this value could be a few different things"
Look at the branch in `loadHtml`: if the input starts with `http://` → fetch a URL; otherwise → read a file. Both paths return a `string`, so the return type is just `Promise<string>` — clean.

But sometimes a value can be *one of several types*. That's a **union type**, written with `|`:

```ts
type InputSource = { kind: "url"; url: string } | { kind: "file"; path: string };
```

This says "an `InputSource` is either a URL-shaped object or a file-shaped object." The `kind` field tells them apart — that's why it's called a **discriminated union** (the `kind` discriminates which one you have). You check it to narrow down:

```ts
if (source.kind === "url") {
  // TS now KNOWS source has a .url, because kind === "url"
  return await fetch(source.url).then(r => r.text());
}
```

**Don't over-engineer this now** — the simple `if (input.startsWith("http://"))` version in the task is fine for v1. Just know unions exist: they're TS's way of modeling "this could be a few different shapes," the way Ruby uses duck-typing and `case`/`when` on a type check.

## Step 2 — Wire it into `cli.ts`

Import and call it. Because `loadHtml` is async, the calling code must be async too. Update `cli.ts`:

```ts
import { loadHtml } from "./fetch.js";

async function main() {
  const options = getOptions();
  for (const input of options.inputs) {
    const html = await loadHtml(input);
    console.log(`loaded ${html.length} bytes from ${input}`);
  }
}

main();
```

Note the **`./fetch.js`** extension on the import — not `./fetch`. This is a NodeNext quirk: in ESM, you import the *compiled* filename (`.js`), and TypeScript resolves it back to `fetch.ts` for you. This catches everyone the first time. If you write `./fetch` it won't resolve.

## Step 3 — Run it

```bash
echo '<h1>Hej</h1>' > /tmp/t.html
npm run dev -- --language da /tmp/t.html
```
Expected: `loaded 14 bytes from /tmp/t.html`.

Then a real URL:
```bash
npm run dev -- --language da https://beta.skujeg.dk/
```
Expected: `loaded N bytes from https://beta.skujeg.dk/` (N = some page size).

## Check you understand
- [ ] I can explain what a `Promise<string>` is and why `async` functions return it.
- [ ] I can explain why I imported `./fetch.js` (not `./fetch`).
- [ ] I can describe a discriminated union and how you'd narrow it with a check.
- [ ] I ran it against both a local file and a URL.
