#!/usr/bin/env node
import { Command } from "commander";
import { loadHtml } from "./fetch.js";
import { scanPage } from "./scan.js";
import { detectLeaks, learnAdoptedWords } from "./detect.js";
import { resolveLanguages } from "./languages.js";
import { printTty, printJson, type PageReport } from "./report.js";

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

async function main() {
  const options = getOptions();

  // Fail fast on an unknown/unsupported language before any network work.
  resolveLanguages(options.language);

  // Load + scan every page first so loanword learning sees the whole site
  // and the allowlist is consistent across pages.
  const pages: { source: string; nodes: import("./scan.js").TextNode[] }[] = [];
  for (const input of options.inputs) {
    const html = await loadHtml(input);
    const nodes = scanPage(html, {
      includeHidden: options.includeHidden,
      includeMeta: options.includeMeta,
    });
    pages.push({ source: input, nodes });
  }

  const allNodes = pages.flatMap((p) => p.nodes);
  const allowlist = learnAdoptedWords(allNodes, options.language, options.minLength);

  const results: PageReport[] = [];
  for (const page of pages) {
    const leaks = detectLeaks(page.nodes, options.language, {
      minLength: options.minLength,
    }, allowlist);
    results.push({ source: page.source, leaks });
  }

  if (options.json) {
    printJson(results);
  } else {
    printTty(results);
  }
  process.exit(results.reduce((n, r) => n + r.leaks.length, 0) > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`error: ${err}`);
  process.exit(2);
});