import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import nspell from "nspell";
const require = createRequire(import.meta.url);
// The official Danish hunspell dictionary (the same word list Firefox /
// LibreOffice ship as the "Danish" language pack). Words in here are by
// definition Danish — including adopted loanwords like "computer", "weekend"
// and "upload" that a statistical detector like lingua reads as English.
let spell = null;
try {
    const entry = require.resolve("dictionary-da");
    const dir = dirname(entry);
    spell = nspell(readFileSync(join(dir, "index.aff"), "utf8"), readFileSync(join(dir, "index.dic"), "utf8"));
}
catch {
    // Dictionary unavailable — degrade gracefully to the learning + seed layers.
}
/** True if `word` (any common casing) is an official Danish dictionary word. */
export function isDanishDictionaryWord(word) {
    if (!spell)
        return false;
    return spell.correct(word);
}
