import { load } from "cheerio";
import { chromium } from "playwright";

export interface CrawlPage {
  source: string;
  html: string;
}

/** Resolves `url` against `base` and strips the fragment. Returns null for junk. */
export function normalizeUrl(url: string, base: string): string | null {
  try {
    const u = new URL(url, base);
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

/** Same-origin links found in `html` (relative links resolved against `baseUrl`). */
export function extractLinks(html: string, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin;
  const $ = load(html);
  const links = new Set<string>();
  $("a[href]").each((_i, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const u = normalizeUrl(href, baseUrl);
    if (!u || !u.startsWith(origin) || u === baseUrl) return; // off-site or self links
    links.add(u);
  });
  return [...links];
}

/**
 * Crawls same-origin pages starting at `startUrls` with a headless browser —
 * the page is rendered by real Chromium, so client-side JS content is scanned
 * too (plain `fetch` never sees it).
 *
 * If `authPath` points at a Playwright storage-state file (created with
 * `lang-leak-checker login`), the saved session is reused, so pages behind
 * login render exactly as they do for a signed-in user.
 */
export async function crawlSite(
  startUrls: string[],
  opts: { maxPages: number; authPath?: string }
): Promise<CrawlPage[]> {
  const browser = await chromium.launch();
  const context = await browser.newContext(
    opts.authPath ? { storageState: opts.authPath } : {}
  );
  const page = await context.newPage();

  const pages: CrawlPage[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];
  for (const u of startUrls) {
    const n = normalizeUrl(u, u);
    if (n) queue.push(n);
  }

  try {
    while (queue.length > 0 && pages.length < opts.maxPages) {
      const url = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);

      let resp;
      try {
        resp = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
      } catch {
        // networkidle may never fire on apps with polling/websockets —
        // use whatever the page has rendered by now.
      }
      if (resp && !resp.ok()) {
        console.error(`warn: HTTP ${resp.status()} at ${url} — skipped`);
        continue;
      }

      const html = await page.content();
      pages.push({ source: url, html });

      for (const link of extractLinks(html, url)) {
        if (!visited.has(link) && !queue.includes(link)) queue.push(link);
      }
    }
  } finally {
    await browser.close();
  }
  return pages;
}