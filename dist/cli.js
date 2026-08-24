#!/usr/bin/env node
import { Command } from "commander";
import { loadHtml } from "./fetch.js";
import { scanPage } from "./scan.js";
import { detectLeaks } from "./detect.js";
import { printTty, printJson } from "./report.js";
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
function getOptions() {
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
    const results = [];
    for (const input of options.inputs) {
        const html = await loadHtml(input);
        const nodes = scanPage(html, {
            includeHidden: options.includeHidden,
            includeMeta: options.includeMeta,
        });
        const leaks = detectLeaks(nodes, options.language, { minLength: options.minLength });
        results.push({ source: input, leaks });
    }
    if (options.json) {
        printJson(results);
    }
    else {
        printTty(results);
    }
    process.exit(results.reduce((n, r) => n + r.leaks.length, 0) > 0 ? 1 : 0);
}
main().catch((err) => {
    console.error(`error: ${err}`);
    process.exit(2);
});
