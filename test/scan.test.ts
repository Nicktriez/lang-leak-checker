import { it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { scanPage } from "../src/scan.js";

it("skips script content and captures visible text from the fixture", async () => {
  const html = await readFile(
    new URL("./fixtures/mixed.html", import.meta.url),
    "utf-8"
  );
  const nodes = scanPage(html, { includeHidden: false, includeMeta: false });
  const texts = nodes.map((n) => n.text);

  // script content must not leak into visible text
  assert.ok(!texts.some((t) => t.includes("color:red")));
  // visible English paragraph is captured
  assert.ok(texts.some((t) => t.includes("Your order has been submitted successfully")));
  // single brand words are captured as elements
  assert.ok(texts.some((t) => t.includes("Netto")));
});