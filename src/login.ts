import { chromium } from "playwright";
import { createInterface } from "node:readline/promises";

/**
 * Opens a headed browser so the user can complete ANY login flow manually —
 * passkeys/WebAuthn, magic links, OAuth, whatever the site uses. Then saves
 * the session (cookies + localStorage) as a Playwright storage-state file,
 * which scans reuse with `--auth <path>`. No credential handling in the tool.
 */
export async function login(url: string, savePath: string): Promise<void> {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log("Browser opened. Complete the login there (any method).");
  await rl.question("Press Enter here once you're logged in… ");
  rl.close();

  await context.storageState({ path: savePath });
  await browser.close();
  console.log(`Saved auth state to ${savePath} — reuse it with: --auth ${savePath}`);
}