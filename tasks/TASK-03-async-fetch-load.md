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
- A `Promise<string>` is a **"string that will arrive later."** It's how JS represents work that hasn't finished yet (a network request, a file read).
- `async function` = a function that returns a Promise. The return type is `Promise<string>`, not `string`.
- `await` = "pause here until this Promise resolves." Code after `await` runs once the value arrives.
- **You can only `await` inside an `async` function.** That's a rule you'll hit constantly — "await is only valid in async function."

> Rails devs: this is like `Async`/`GoodJob`/sidekiq jobs — work that completes later. But in JS it's the *default* for any I/O, not opt-in.

### Union types — the fork in the road
Look at the branch: `http://` → fetch, otherwise → read file. Both return a `string`, so the function's return type is just `Promise<string>`. That's clean.

But now add a third type to the *inputs* concept — the union. Unions are written with `|`:

```ts
type InputSource = { kind: "url"; url: string } | { kind: "file"; path: string };
```

This is a **discriminated union** — an object that's one of several shapes, distinguished by a `kind` field. It's TS's replacement for Ruby's duck-typing / case-when on type. You narrow it with a check:

```ts
if (source.kind === "url") {
  return await fetch(source.url).then(r => r.text());
}
```

**Don't over-engineer this now** — the simple `if (input.startsWith("http://"))` version is fine for v1. Just know unions exist and are how TS models "this value could be a few different things."

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
