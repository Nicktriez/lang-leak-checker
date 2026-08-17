# Task 8 — Testing with Node's built-in test runner (TDD)

> **Rails analogy:** This is RSpec/minitest, but built into Node itself — no extra framework. `node --test` is your `rake test`, `it(...)` blocks are your `it "..." do ... end`.

## What you'll learn
- The test runner setup (why `tsx` is in the test command)
- Writing `it()` tests with `assert`
- Testing pure functions (the easy, valuable kind)
- Test fixtures — sample HTML files

## Step 1 — Understand the test command

From Task 0, the script is:

```json
"test": "node --test --import tsx test/"
```

- `node --test` — Node's built-in test runner, discovers files in `test/`.
- `--import tsx` — tells Node to use `tsx` as the loader so it can run `.test.ts` files without a separate compile. This is why `tsx` is a devDependency.

## Step 2 — Create test fixtures

These are reusable HTML samples. Create `test/fixtures/mixed.html`:

```html
<!DOCTYPE html>
<html lang="da">
<head><title>Skujeg — test</title></head>
<body>
  <h1>Find de billigste dagligvarer</h1>
  <p class="ok-loanword">Tak! Din pris hjalp gruppen til Community — du fik 5 point.</p>
  <p class="leak">Your order has been submitted successfully and is being processed.</p>
  <span>Netto</span>
  <span>Coca-Cola</span>
  <span>42,95 kr</span>
  <script>const x = "color:red";</script>
</body>
</html>
```

And `test/fixtures/clean.html`:

```html
<!DOCTYPE html><html lang="da"><body><h1>Hej og velkommen</h1></body></html>
```

## Step 3 — Create `test/detect.test.ts`

```ts
import { it } from "node:test";
import assert from "node:assert/strict";
import { detectLeaks } from "../src/detect.js";

it("flags a wholly-English element when target is Danish", () => {
  const leaks = detectLeaks(
    [
      { elementPath: "h1", text: "Welcome to our site, find the best deals here" },
      { elementPath: "p", text: "Velkommen til vores side" },
    ],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].elementPath, "h1");
  assert.equal(leaks[0].detected, "eng");
});

it("does NOT flag Danish text with an English loanword", () => {
  const leaks = detectLeaks(
    [{ elementPath: "p.leak", text: "Tak! Din pris hjalp gruppen til Community — du fik 5 point." }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("does NOT flag short/ambiguous single-word elements", () => {
  const leaks = detectLeaks(
    [
      { elementPath: "a.nav", text: "Butik" },
      { elementPath: "a.nav", text: "Kurv" },
      { elementPath: "span", text: "Netto" },
    ],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("ignores text below the min-length threshold", () => {
  const leaks = detectLeaks([{ elementPath: "span", text: "OK" }], "da", { minLength: 3 });
  assert.equal(leaks.length, 0);
});
```

## Read this — the concepts

### `import { it } from "node:test"` + `assert`
- `it("description", () => { ... })` — a single test. The string is the human-readable description; the function runs the assertion. If any `assert` throws, the test fails.
- `assert.equal(a, b)` — the simplest check: `a` must equal `b`. `node:assert/strict` is the strict version (uses `===`).

### Why these tests are "pure" and valuable
`detectLeaks` is a **pure function** — same input always gives same output, no I/O, no side effects. That makes it trivially testable: you pass in `TextNode` objects and check the `Leak[]` that comes back. **This is the kind of function to design for** — logic separated from I/O (fetch/print) so it's testable in isolation.

### The tests encode the business contract
Read what these tests assert — they're the exact requirements we locked in:
1. Whole English element → flagged.
2. Danish-with-loanword (`Community`) → NOT flagged.
3. Short nav/brand words (`Butik`, `Kurv`, `Netto`) → NOT flagged.
4. Below `minLength` → skipped.

**These tests ARE the spec.** When the code changes later, these are the guardrails that tell you if you broke the contract. An agent or future-you can't "think it's clean" — the tests say so.

## Step 4 — Run the tests

```bash
npm test
```

If you did Task 6 correctly with real lingua, all pass. If `Butik`/`Kurv` get flagged, raise `CONFIDENCE_THRESHOLD` in `detect.ts`. **Do not weaken the tests to make them pass** — the tests are right; the threshold is what adjusts.

## Step 5 — Add a test for `scanPage` (optional stretch)

Create `test/scan.test.ts` that reads the fixture file and checks `scanPage` skips `<script>` content and captures visible text. This teaches reading files in tests and testing another pure function.

## Check you understand
- [ ] I can explain what `it()` and `assert.equal` do.
- [ ] I can explain why `detectLeaks` is "pure" and why that makes it easy to test.
- [ ] I can read the four tests as the encoded business contract.
- [ ] I ran `npm test` and it passes.
