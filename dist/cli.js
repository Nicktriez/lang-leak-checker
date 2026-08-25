#!/usr/bin/env node
import { Command } from "commander";
import { createRequire } from "node:module";
import { loadHtml } from "./fetch.js";
import { scanPage } from "./scan.js";
import { detectLeaks, learnAdoptedWords } from "./detect.js";
import { resolveLanguages, SUPPORTED_CODES } from "./languages.js";
import { crawlSite } from "./crawl.js";
import { login } from "./login.js";
import { printTty, printJson } from "./report.js";
const { version } = createRequire(import.meta.url)("../package.json");
function collect(value, prev) {
    prev.push(value);
    return prev;
}
const program = new Command()
    .name("lang-leak-checker")
    .description("Find inner HTML that is not in the chosen language")
    .version(version)
    .requiredOption("-l, --language <code>", `target language ISO 639-1 code (${SUPPORTED_CODES})`)
    .option("-m, --min-length <n>", "skip text shorter than this", "3")
    .option("--include-meta", "include title/meta in the scan", false)
    .option("--include-hidden", "include script/style/svg text", false)
    .option("--json", "machine-readable output", false)
    .option("--crawl", "crawl the site from the given URL(s) with a headless browser", false)
    .option("--auth <file>", "storage-state file from `login` (reuses your session; implies --crawl)")
    .option("--max-pages <n>", "max pages when crawling", "50")
    .option("--exclude <selector>", "skip elements matching this CSS selector, e.g. data regions (repeatable)", collect, [])
    .option("--exclude-url <pattern>", "skip crawled pages whose URL contains this substring, e.g. '/products' (repeatable)", collect, [])
    .argument("<inputs...>", "file path(s) or URL(s)")
    .action(async () => {
    try {
        await main();
    }
    catch (err) {
        console.error(`error: ${err}`);
        process.exit(2);
    }
});
program
    .command("login <url>")
    .description("open a browser, log in manually, and save the session for --auth")
    .option("--save <path>", "where to save the storage state", "auth.json")
    .action(async (url, opts) => {
    try {
        await login(url, opts.save);
    }
    catch (err) {
        console.error(`error: ${err}`);
        process.exit(2);
    }
});
program.parse(process.argv);
function getOptions() {
    const opts = program.opts();
    return {
        language: opts.language,
        minLength: Number(opts.minLength),
        includeMeta: opts.includeMeta,
        includeHidden: opts.includeHidden,
        json: opts.json,
        crawl: opts.crawl,
        auth: opts.auth,
        maxPages: Number(opts.maxPages),
        exclude: opts.exclude,
        excludeUrl: opts.excludeUrl,
        inputs: program.args,
    };
}
async function main() {
    const options = getOptions();
    // Fail fast on an unknown/unsupported language before any network work.
    resolveLanguages(options.language);
    // --auth needs the browser, so it implies --crawl.
    const crawl = options.crawl || options.auth !== undefined;
    // Load + scan every page first so loanword learning sees the whole site
    // and the allowlist is consistent across pages.
    let pages;
    if (crawl) {
        const crawled = await crawlSite(options.inputs, {
            maxPages: options.maxPages,
            authPath: options.auth,
            excludeUrlPatterns: options.excludeUrl,
        });
        pages = crawled.map((p) => ({
            source: p.source,
            nodes: scanPage(p.html, {
                includeHidden: options.includeHidden,
                includeMeta: options.includeMeta,
                excludeSelectors: options.exclude,
            }),
        }));
    }
    else {
        pages = [];
        for (const input of options.inputs) {
            const html = await loadHtml(input);
            pages.push({
                source: input,
                nodes: scanPage(html, {
                    includeHidden: options.includeHidden,
                    includeMeta: options.includeMeta,
                    excludeSelectors: options.exclude,
                }),
            });
        }
    }
    const allNodes = pages.flatMap((p) => p.nodes);
    const allowlist = learnAdoptedWords(allNodes, options.language, options.minLength);
    const results = [];
    for (const page of pages) {
        const leaks = detectLeaks(page.nodes, options.language, {
            minLength: options.minLength,
        }, allowlist);
        results.push({ source: page.source, leaks });
    }
    if (options.json) {
        printJson(results);
    }
    else {
        printTty(results);
    }
    process.exit(results.reduce((n, r) => n + r.leaks.length, 0) > 0 ? 1 : 0);
}
