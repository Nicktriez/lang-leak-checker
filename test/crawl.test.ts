import { it } from "node:test";
import assert from "node:assert/strict";
import { normalizeUrl, extractLinks } from "../src/crawl.js";

it("extractLinks keeps same-origin links and resolves relatives", () => {
  const html = `
    <a href="/tilbud">x</a>
    <a href="https://beta.skujeg.dk/leaderboard">y</a>
    <a href="https://other.com/x">z</a>
    <a href="#frag">frag</a>
    <a href="mailto:hi@example.com">mail</a>
  `;
  const links = extractLinks(html, "https://beta.skujeg.dk/");
  assert.deepEqual(
    links.sort(),
    ["https://beta.skujeg.dk/leaderboard", "https://beta.skujeg.dk/tilbud"].sort()
  );
});

it("normalizeUrl strips fragments and keeps queries", () => {
  assert.equal(normalizeUrl("/a#b", "https://x.dk/"), "https://x.dk/a");
  assert.equal(normalizeUrl("/a?p=2", "https://x.dk/"), "https://x.dk/a?p=2");
});

it("normalizeUrl returns null for unparseable URLs", () => {
  assert.equal(normalizeUrl("https://[bad", "https://x.dk/"), null);
});