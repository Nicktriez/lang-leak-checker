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