# Task 1 — `tsconfig.json`: what TypeScript actually does

> **Rails analogy:** `tsconfig.json` is your Ruby version + `.rubocop.yml` + a bundler config, all in one. It tells the TS compiler *how* to compile and *how strict* to be.

## What you'll learn
- TypeScript is a **type-checker + compiler**: it checks your types, then strips them out to produce plain JS.
- The `tsconfig.json` options that matter for a CLI: `strict`, `module`, `target`, `outDir`, `rootDir`.
- Why `tsc` (the compiler) and `tsx` (the dev runner) are different tools doing different jobs.

## The key mental model

TypeScript does **two separate things**:
1. **Type-checking** — reads your `.ts`, verifies types line up, and errors if not. Happens at compile time, never at runtime.
2. **Transpiling** — strips all the type annotations and produces clean `.js`. **Types do not exist at runtime.** They're compile-time-only safety, then deleted.

That's the single most important TS concept for a Rails dev: **the types are training wheels for the compiler, not code. The browser/Node runs plain JS.**

## What to do

**Step 1 — Create `tsconfig.json`.**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

**Step 2 — Understand each option. Write a one-line explanation next to each** (put it in a comment or your notes — the point is YOU can explain them):

| Option | What it does | Rails analogy |
|---|---|---|
| `strict: true` | Turns on ALL type-safety checks. No `null` where a string is expected, no implicit `any`. | Rubocop with every cop enabled — annoying at first, saves you later |
| `target: "ES2022"` | What JS version to output. Modern → `import`/`export` preserved. | Your Ruby target version |
| `module: "NodeNext"` | Module system for output — pairs with `type: module`. | n/a |
| `moduleResolution: "NodeNext"` | How TS finds imported files. | Bundler's resolution |
| `outDir: "dist"` | Where compiled `.js` goes. | `lib/` in a gem |
| `rootDir: "src"` | Source lives in `src/`, so `src/cli.ts` → `dist/cli.js`. | `app/` |
| `esModuleInterop: true` | Lets `import cheerio from 'cheerio'` work even for CJS packages | Bundler interop |
| `skipLibCheck: true` | Skip type-checking third-party `.d.ts` files (they're the library's job, not yours) | Skip Rubocop on gems |

**Step 3 — The `strict` rule is the one that will teach you the most.** Leave it `true`. It will fight you constantly at first ("Object is possibly 'undefined'", "Type 'string | undefined' is not assignable to type 'string'"). **That friction IS the lesson** — strict mode forces you to actually handle the edge cases (null, missing values, empty arrays) instead of hoping they don't happen. When you get an error, read what it's telling you about a value that *might not exist*, and handle it. Don't just `// @ts-ignore` it.

## What `tsc` vs `tsx` do (don't confuse these)

- **`tsc`** (the `build` script) = the compiler. Reads `src/`, type-checks, outputs `dist/*.js`. Slow-ish, production artifact.
- **`tsx`** (the `dev` script) = a fast runner that executes `.ts` directly without compiling to disk first. Instant feedback for development, like `rails runner` / `bin/rails console`.

For now: use `npm run dev` while developing (fast), `npm run build` to produce the final artifact.

## Check you understand
- [ ] I can explain that "TypeScript" = type-checking + transpiling, and that types vanish at runtime.
- [ ] I can explain `strict: true` and give one example of an error it would catch.
- [ ] I can explain why `module: NodeNext` pairs with `"type": "module"` in package.json.
- [ ] I can explain the difference between `npm run dev` (tsx) and `npm run build` (tsc).
