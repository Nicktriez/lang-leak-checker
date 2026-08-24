import { it } from "node:test";
import assert from "node:assert/strict";
import { detectLeaks } from "../src/detect.js";
import { isCompiled } from "../src/languages.js";

it("flags a wholly-English element when target is Danish", () => {
  const leaks = detectLeaks(
    [
      { elementPath: "h1", text: "Welcome to our site, find the best deals here" },
      { elementPath: "p", text: "Velkommen til vores side" },
    ],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].elementPath, "h1");
  assert.equal(leaks[0].detected, "English");
});

it("does NOT flag Danish text with an English loanword", () => {
  const leaks = detectLeaks(
    [{ elementPath: "p.leak", text: "Tak! Din pris hjalp gruppen til Community — du fik 5 point." }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("does NOT flag an element that reads English only because of a loanword (Upload kvittering, learned, not seeded)", () => {
  const leaks = detectLeaks(
    [{ elementPath: "a.nav", text: "Upload kvittering" }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("learns a loanword from the scan, then still flags the real English on the same page", () => {
  const leaks = detectLeaks(
    [
      { elementPath: "a.nav", text: "Upload kvittering" },
      { elementPath: "p", text: "Your order has been submitted successfully and is being processed." },
    ],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].elementPath, "p");
  assert.equal(leaks[0].detected, "English");
});

it("does NOT auto-adopt a lone English heading like Leaderboard", () => {
  const leaks = detectLeaks(
    [
      { elementPath: "a.nav", text: "Upload kvittering" },
      { elementPath: "h1", text: "Leaderboard" },
    ],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].elementPath, "h1");
});

it("still flags a wholly-English element that merely contains a loanword", () => {
  const leaks = detectLeaks(
    [{ elementPath: "p", text: "Points for uploading receipts and for crowd price reports that reach a trust tier." }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].detected, "English");
});

it("passes officially adopted Danish loanwords via the dictionary (computer)", () => {
  const leaks = detectLeaks(
    [{ elementPath: "span", text: "computer" }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("dictionary words inside real English copy do NOT rescue it (Welcome to our site)", () => {
  const leaks = detectLeaks(
    [{ elementPath: "h1", text: "Welcome to our site, find the best deals here" }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].detected, "English");
});

it("does NOT flag short/ambiguous single-word elements", () => {
  const leaks = detectLeaks(
    [
      { elementPath: "a.nav", text: "Butik" },
      { elementPath: "a.nav", text: "Kurv" },
      { elementPath: "span", text: "Netto" },
    ],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("Polyglot: Polish text is not flagged when the target is pl", () => {
  const leaks = detectLeaks(
    [{ elementPath: "p", text: "Witamy na naszej stronie internetowej" }],
    "pl",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("Polyglot: English text is flagged when the target is pl", () => {
  const leaks = detectLeaks(
    [{ elementPath: "h1", text: "Welcome to our website" }],
    "pl",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].detected, "English");
});

it("Polyglot: adopted Polish loanword (komputer) is not flagged", () => {
  const leaks = detectLeaks(
    [{ elementPath: "span", text: "komputer" }],
    "pl",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("rejects an unsupported language code", () => {
  assert.throws(() => detectLeaks([], "xx", { minLength: 3 }), /unsupported language 'xx'/);
});

it(
  "rejects a mapped-but-uncompiled language with a rebuild hint",
  { skip: isCompiled("German") ? "German is compiled in this artifact" : false },
  () => {
    assert.throws(() => detectLeaks([], "de", { minLength: 3 }), /NOT compiled into the wasm detector/);
  }
);

it("ignores text below the min-length threshold", () => {
  const leaks = detectLeaks([{ elementPath: "span", text: "OK" }], "da", { minLength: 3 });
  assert.equal(leaks.length, 0);
});