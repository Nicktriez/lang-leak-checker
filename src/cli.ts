#!/usr/bin/env node
import { Command } from "commander";
import { loadHtml } from "./fetch.js";
import { scanPage } from "./scan.js";

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

async function main() {
  const options = getOptions();
  for (const input of options.inputs) {
    const html = await loadHtml(input);
    console.log(`loaded ${html.length} bytes from ${input}`);

    const nodes = scanPage(html, { includeHidden: false, includeMeta: false });
    console.log(nodes.slice(0, 5));
  }
}

main();
