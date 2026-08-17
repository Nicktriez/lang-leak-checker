# Task 6 — The real detector: lingua-wasm, and working with a compiled wasm dependency

> **Rails analogy:** This is the one place we bring in a *native/compiled* component — think of it like a Rust gem (`libvips`, `Nokogiri` with native extensions). The tool stays TS; this is just a library it calls.

## What you'll learn
- Why accuracy forced lingua over `franc` (recap with the real evidence)
- Building a wasm artifact once and checking it in
- Calling a wasm module from TS and adapting its output to your types
- The confidence-threshold pattern done properly

## Step 1 — The reason lingua (recap, with evidence)

We tested `franc` against real strings and it failed the core case: it flagged short Danish nav words as English.

```
"Butik" → "eng"   ✗ (Danish)
"Kurv" → "eng"    ✗ (Danish)
"Welcome..." → "eng" ✓ (correct)
```

That would scream false positives on the exact page you care about. `lingua` is built for short-text accuracy — the UI-string length this tool targets. So lingua is the detector.

## Step 2 — Build the wasm once (one-time, then checked in)

> This is the **only** Rust in the project, and it's a build step, not the project language. You run this once, commit the output, and never touch Rust again.

```bash
cargo new --lib lingua-wasm && cd lingua-wasm
```

Edit `Cargo.toml`:

```toml
[lib]
crate-type = ["cdylib"]

[dependencies]
lingua = { version = "1.8", default-features = false, features = ["danish", "english"] }
wasm-bindgen = "0.2"
```

Then build to wasm:

```bash
cargo install wasm-pack
wasm-pack build --target nodejs
mkdir -p ../wasm
cp pkg/*.wasm pkg/*.js ../wasm/
cd ..
```

This creates `wasm/` with the compiled detector + a Node wrapper. **Commit `wasm/`** so no consumer ever rebuilds it. (If you don't have Rust installed, this is the one time you'd need it — or ask Ultron to do the build and you commit the artifact.)

## Step 3 — Replace the placeholder in `detect.ts`

Now swap the `guess*` placeholders for the real detector. The exact API depends on the wasm wrapper, but the shape is:

```ts
import { LanguageDetectorBuilder, Language } from "../wasm/lingua_wasm.js";
import type { TextNode } from "./scan.js";

export interface Leak {
  elementPath: string;
  text: string;
  detected: string;
  confidence: number;
}

const detector = LanguageDetectorBuilder
  .fromLanguages([Language.Danish, Language.English])
  .withLowAccuracyMode() // plenty for da/en, faster
  .build();

const CONFIDENCE_THRESHOLD = 0.9;

export function detectLeaks(
  nodes: TextNode[],
  target: string,
  opts: { minLength: number }
): Leak[] {
  const targetLang = target === "da" ? Language.Danish : Language.English;
  const leaks: Leak[] = [];

  for (const node of nodes) {
    if (node.text.length < opts.minLength) continue;

    const confidences = detector.computeLanguageConfidenceValues(node.text);
    const [bestLang, bestConf] = Object.entries(confidences)
      .sort((a, b) => b[1] - a[1])[0] ?? [null, 0];

    if (bestLang == null) continue;
    if (bestConf < CONFIDENCE_THRESHOLD) continue; // slang/ambiguous → skip
    if (bestLang === targetLang) continue;          // confident target → clean

    leaks.push({
      elementPath: node.elementPath,
      text: node.text,
      detected: bestLang === Language.English ? "eng" : "dan",
      confidence: bestConf,
    });
  }
  return leaks;
}
```

## Read this — the concepts

### `Object.entries(...)` + `sort` — the "most confident language" idiom
`computeLanguageConfidenceValues` returns a map like `{ Danish: 0.03, English: 0.97 }`. We want the highest. `Object.entries` turns it into an array of `[key, value]` pairs, `.sort((a,b) => b[1]-a[1])` sorts descending by the numeric value, `[0]` grabs the top, and `?? [null, 0]` gives a safe default if the map is empty. Destructuring `const [bestLang, bestConf] = ...` unpacks the pair.

This is a **map → array → sort → unpack** chain. It looks dense but it's four familiar steps glued with modern syntax. Read it one piece at a time.

### `?? [null, 0]` — default for a possibly-missing value
If `Object.entries` returned `[]` (empty), `[0]` would be `undefined`. `?? [null, 0]` substitutes a default pair so `bestLang` is `null` (caught by the next line) instead of crashing. This is the safe-handling pattern from Task 4 applied to array access.

### The threshold stays the load-bearing rule
Notice the logic didn't change from Task 5 — only the *source* of `detected`/`confidence` did. The four-line filter (`minLength` → threshold → target → leak) is unchanged. **That's the value of defining your interface first** — you swapped the engine without touching the logic. This is exactly why we built `detect.ts` with placeholders in Task 5.

## Check you understand
- [ ] I can explain why lingua over franc, using the `Butik`/`Kurv` evidence.
- [ ] I understand the wasm build is one-time and the artifact is committed.
- [ ] I can read the `Object.entries` + `sort` + destructure chain.
- [ ] I noticed the Task 5 logic didn't change — only the engine did.
