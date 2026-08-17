# Task 2 — Your first TypeScript: types, interfaces, and a CLI

> **Rails analogy:** TypeScript's type annotations are like Rails' strong parameters / schema — they declare *what shape* data must have, and the compiler refuses if you hand it the wrong shape.

## What you'll learn
- Primitive types: `string`, `number`, `boolean`
- Type annotations on function parameters and return values
- `interface` — TS's version of a schema/struct for objects
- A real `import`/`export` between files
- `commander` for CLI argument parsing

## Step 1 — Create `src/cli.ts` (the entry point)

The shebang on line 1 makes Node execute this file as a script (it's what `bin` points at):

```ts
#!/usr/bin/env node
import { Command } from "commander";

interface CliOptions {
  language: string;
  minLength: number;
  includeMeta: boolean;
  includeHidden: boolean;
  json: boolean;
  inputs: string[];
}

const program = new Command()
  .name("lang-leak-checker")
  .description("Find inner HTML that is not in the chosen language")
  .version("0.1.0")
  .requiredOption("-l, --language <code>", "target language ISO 639-1 code")
  .option("-m, --min-length <n>", "skip text shorter than this", "3")
  .option("--include-meta", "include title/meta in the scan", false)
  .option("--include-hidden", "include script/style/svg text", false)
  .option("--json", "machine-readable output", false)
  .argument("<inputs...>", "file path(s) or URL(s)");

program.parse(process.argv);

function getOptions(): CliOptions {
  const opts = program.opts();
  return {
    language: opts.language,
    minLength: Number(opts.minLength),
    includeMeta: opts.includeMeta,
    includeHidden: opts.includeHidden,
    json: opts.json,
    inputs: program.args,
  };
}

const options = getOptions();
console.log("language:", options.language);
console.log("inputs:", options.inputs);
```

## What's happening — read this

1. **`interface CliOptions { ... }`** — declares a contract: an object with these exact fields and types. This is TS's "schema." `getOptions()` *must* return something that matches it, or the compiler errors. This is your first taste of why TS beats plain JS: the shape is enforced.

2. **`function getOptions(): CliOptions`** — the `: CliOptions` after the parens is the **return type**. You're telling the compiler "this function returns a `CliOptions`," and it verifies you're telling the truth. If you forgot to return `inputs`, TS would catch it.

3. **`opts.language` is typed as `any`** — `commander`'s `opts()` returns a loosely-typed object, so TS can't know what's inside. That's why we funnel it through `getOptions()`: it converts the "any" commander world into our strict `CliOptions` schema at the boundary. **This is a pattern you'll use constantly** — strict types inside your code, loose types shimmed at the edges where third-party libs hand you `any`.

## Step 2 — Run it

```bash
npm run dev -- --language da test/nothing.html
```

Expected: prints `language: da` and the input. Try:
- `npm run dev -- --language da` (no input) → commander errors (`.argument` required).
- `npm run dev` (no `--language`) → commander errors (`.requiredOption`).

## Step 3 — Try to break it (this is how you learn)

Edit `getOptions()` to return `{ language: opts.language }` (drop the other fields), then run `npm run dev`. **The compiler will fail** with something like `Property 'minLength' is missing in type`. Read that error carefully — it's TS telling you your return value doesn't match the `CliOptions` contract. Put the fields back.

## The learning point
The whole game is: **declare the shape with an interface, then let the compiler enforce it.** In Rails, your data shape is implicit (hashes). In TS, it's declared and checked. The friction you feel ("why won't it compile") is TS refusing to let a wrong-shaped object through — that's the feature.

## Check you understand
- [ ] I can explain what an `interface` does and why it's like a schema.
- [ ] I can explain the `: CliOptions` return-type annotation.
- [ ] I can explain why `getOptions()` exists (shimming commander's loose `any` into a strict schema).
- [ ] I deliberately broke it and read the compiler error.
