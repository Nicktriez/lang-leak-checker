# Task 5 — The detector: logic, filtering, and your core interface

> **Rails analogy:** This is a service object — pure logic that takes an input, applies rules, and returns a structured result. No I/O here.

## What you'll learn
- The `Leak` interface — your core domain type
- Iterating, filtering, and transforming arrays
- The "skip, don't guess" confidence rule (the heart of the tool)
- Conditionals and early `continue`

## Step 1 — Create `src/detect.ts`

We're building this against the lingua-wasm detector from the plan. To keep this task focused on **logic and types** (not the wasm build, which is Task 6), we'll define the interface first and stub the detector call:

```ts
import type { TextNode } from "./scan.js";

export interface Leak {
  elementPath: string;
  text: string;
  detected: string; // "eng" or "dan"
  confidence: number;
}

export function detectLeaks(
  nodes: TextNode[],
  target: string,
  opts: { minLength: number }
): Leak[] {
  const leaks: Leak[] = [];

  for (const node of nodes) {
    if (node.text.length < opts.minLength) continue;

    // placeholder — Task 6 replaces this with the real lingua call
    const detected = guessLanguage(node.text);
    const confidence = guessConfidence(node.text);

    if (confidence < 0.9) continue;          // short/ambiguous/slang → skip, don't guess
    if (detected === target) continue;       // confidently the target language → clean

    leaks.push({
      elementPath: node.elementPath,
      text: node.text,
      detected,
      confidence,
    });
  }
  return leaks;
}
```

The two `guess*` functions are placeholders so this task compiles and the *logic* is testable. Task 6 swaps them for the real lingua detector:

```ts
// TEMP placeholders — remove in Task 6
function guessLanguage(text: string): string {
  return text.includes("Welcome") ? "eng" : "dan";
}
function guessConfidence(text: string): number {
  return text.includes("Welcome") ? 0.99 : 0.99;
}
```

## Read this — the concepts

### The `Leak` interface — your domain contract
`Leak` is the type that flows through the whole tool: an element that's *wrong-language*. It carries everything a fixer needs: which element (`elementPath`), what it said (`text`), what language it actually is (`detected`), and how sure we are (`confidence`). Define it once, and every function that handles leaks shares the same shape.

### The four-line decision is the whole tool
Read the middle of the loop — it's the complete business rule of lang-leak-checker:

```ts
if (node.text.length < opts.minLength) continue; // too short, skip
if (confidence < 0.9) continue;                  // not sure, skip
if (detected === target) continue;               // correct language, skip
leaks.push({ ... });                             // confident + wrong → it's a leak
```

This is a **filter pipeline**: four checks, each discarding things that aren't leaks, and only the last one emits. It encodes exactly the requirement we locked in — *"slang and loanwords pass; only an element confidently in the wrong language is flagged."* The `continue` keyword skips to the next iteration, so only text that survives all three guards becomes a leak.

### Reading the type signatures
- `detectLeaks(nodes: TextNode[], target: string, opts: { minLength: number }): Leak[]`
  - `TextNode[]` — an array of `TextNode` (from scan.ts). 
  - `opts: { minLength: number }` — an **inline object type** (no interface needed for a one-off).
  - `: Leak[]` — returns an array of `Leak`.

### `interface` vs `type`
You've seen `interface CliOptions`, `interface TextNode`, `interface Leak`. TS also has `type X = ...`. For objects they're nearly interchangeable; `interface` is the idiomatic default for object shapes, `type` for unions and aliases (like the `InputSource` union in Task 3). Don't overthink the distinction — `interface` for object shapes is the rule you'll use 95% of the time.

## Step 2 — Wire it into `cli.ts`

```ts
import { detectLeaks } from "./detect.js";
const leaks = detectLeaks(nodes, options.language, { minLength: options.minLength });
console.log("leaks:", leaks);
```

Run against a page with a known English string and confirm the `Leak` objects appear.

## Check you understand
- [x] I can explain what the `Leak` interface captures and why each field matters.
- [x] I can walk through the four-line filter and say which guard does what.
- [x] I can explain `continue` and why only confident wrong-language text becomes a leak.
- [x] I can explain the difference between `interface` and `type`.
