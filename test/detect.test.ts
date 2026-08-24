import { it } from "node:test";
import assert from "node:assert/strict";
import { detectLeaks } from "../src/detect.js";

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
  assert.equal(leaks[0].detected, "eng");
});

it("does NOT flag Danish text with an English loanword", () => {
  const leaks = detectLeaks(
    [{ elementPath: "p.leak", text: "Tak! Din pris hjalp gruppen til Community — du fik 5 point." }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("does NOT flag an element that reads English only because of a loanword (Upload kvittering)", () => {
  const leaks = detectLeaks(
    [{ elementPath: "a.nav", text: "Upload kvittering" }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 0);
});

it("still flags a wholly-English element that merely contains a loanword", () => {
  const leaks = detectLeaks(
    [{ elementPath: "p", text: "Points for uploading receipts and for crowd price reports that reach a trust tier." }],
    "da",
    { minLength: 3 }
  );
  assert.equal(leaks.length, 1);
  assert.equal(leaks[0].detected, "eng");
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

it("ignores text below the min-length threshold", () => {
  const leaks = detectLeaks([{ elementPath: "span", text: "OK" }], "da", { minLength: 3 });
  assert.equal(leaks.length, 0);
});