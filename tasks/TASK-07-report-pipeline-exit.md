# Task 7 — The report: output, exit codes, and the whole pipeline

> **Rails analogy:** This is your `respond_to` / presenter layer — taking the domain data and formatting it for output, plus the CLI's exit status (like `exit 1` in a rake task failing).

## What you'll learn
- `console.log` and string interpolation (template literals)
- `JSON.stringify` for machine-readable output
- `process.exit` and exit codes (`0` clean, `1` leaks, `2` error)
- Tying all the modules together into one working command

## Step 1 — Create `src/report.ts`

```ts
import type { Leak } from "./detect.js";

export interface PageReport {
  source: string;
  leaks: Leak[];
}

export function printTty(results: PageReport[]): number {
  let total = 0;
  for (const page of results) {
    if (page.leaks.length === 0) continue;
    console.log(`# ${page.source}`);
    for (const leak of page.leaks) {
      console.log(`  ${leak.elementPath} (${leak.detected}): "${leak.text}"`);
      total++;
    }
  }
  console.log(`\n${total} leaks across ${results.length} pages`);
  return total;
}

export function printJson(results: PageReport[]): void {
  console.log(JSON.stringify(results, null, 2));
}
```

## Read this — the concepts

### Template literals — backticks with `${}`
`` `# ${page.source}` `` — the backtick string with `${expr}` interpolation is TS/JS's version of Ruby's `"#{}"` interpolation. Unlike Ruby's `#{}`, **any expression** works inside `${}`, including `page.leaks.length` and method calls. It's the idiomatic way to build strings. You'll use it constantly.

### `void` return type
`printJson(...): void` means "returns nothing." `void` is the type for "this function doesn't return a value" — it just does side effects (printing). The compiler won't let you treat a `void` function's result as a value.

### `process.exit`
`process.exit(code)` ends the program immediately with an exit code. The shell sees it:
- `0` = success
- non-zero = failure

That's the whole CI/agent contract: **the shell (and the AI agent) decides "done or not" by the exit code.** Our tool returns `0` when clean, `1` when there are leaks, `2` on a hard error.

## Step 2 — Assemble the full pipeline in `cli.ts`

Replace the debug code with the complete flow:

```ts
#!/usr/bin/env node
import { Command } from "commander";
import { loadHtml } from "./fetch.js";
import { scanPage } from "./scan.js";
import { detectLeaks } from "./detect.js";
import { printTty, printJson, type PageReport } from "./report.js";

// ... (the CliOptions interface + getOptions() from Task 2, unchanged) ...

async function main() {
  const options = getOptions();
  const results: PageReport[] = [];

  for (const input of options.inputs) {
    const html = await loadHtml(input);
    const nodes = scanPage(html, {
      includeHidden: options.includeHidden,
      includeMeta: options.includeMeta,
    });
    const leaks = detectLeaks(nodes, options.language, { minLength: options.minLength });
    results.push({ source: input, leaks });
  }

  const total = printTty(results);
  if (options.json) printJson(results);
  process.exit(total > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`error: ${err}`);
  process.exit(2);
});
```

## Read this — the concepts

### The pipeline — each module feeds the next
```
loadHtml → html (string)
scanPage → nodes (TextNode[])
detectLeaks → leaks (Leak[])
results.push → PageReport[]
printTty / printJson → output
process.exit → exit code
```
Each function takes the previous one's output and produces the next input. **This is the whole architecture** — five small, typed, single-purpose functions composed into a command. TypeScript's interfaces are what make the seams clean: you know `scanPage` hands you `TextNode[]` and `detectLeaks` wants `TextNode[]`, so they snap together.

### `main().catch(...)` — error handling at the boundary
`main()` is async and returns a `Promise`. `.catch((err) => ...)` catches any error thrown anywhere inside (a failed fetch, a bad file). We print it and exit `2`. This is the "rescue at the top level" pattern — you don't wrap every call in try/catch; you let errors bubble up to one handler at the entry point.

### `.slice(0, 5)` / early returns are gone — you're at the real tool now
Every previous task had debug scaffolding. This is the actual command. Delete the debug `console.log` lines from earlier tasks.

## Step 3 — Run it end to end

Create a mixed test file and run:

```bash
cat > /tmp/mixed.html <<'EOF'
<!DOCTYPE html><html lang="da"><body>
  <h1>Find de billigste dagligvarer</h1>
  <p>Your order has been submitted successfully.</p>
  <p>Tak! Din pris hjalp gruppen til Community.</p>
</body></html>
EOF

npm run dev -- --language da /tmp/mixed.html
echo "exit code: $?"
```

Expected: flags only the wholly-English paragraph ("Your order has been submitted successfully."), does NOT flag the `Community` loanword line, prints `1 leaks across 1 pages`, and `exit code: 1`.

Then:
```bash
npm run dev -- --language da --json /tmp/mixed.html
```
Expected: valid JSON.

And against a URL:
```bash
npm run dev -- --language da https://beta.skujeg.dk/
```

## Check you understand
- [ ] I can explain template literals (backticks + `${}`) vs Ruby interpolation.
- [ ] I can explain `void` and `process.exit` codes.
- [ ] I can describe the five-function pipeline and how each feeds the next.
- [ ] I ran the end-to-end test: only the English paragraph flagged, exit 1.
