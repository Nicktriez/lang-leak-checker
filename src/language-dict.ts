import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import nspell from "nspell";
import { SUPPORTED_LANGUAGES } from "./languages.js";

const require = createRequire(import.meta.url);

type WordCheck = (word: string) => boolean;
const cache = new Map<string, WordCheck | null>();

/**
 * Returns a predicate that answers "is this word an official word of the
 * target language?" using that language's hunspell dictionary (the same word
 * list Firefox ships as its language pack). Returns null when no dictionary
 * is configured/installed for the language — the detector then falls back to
 * learning + seed only.
 */
export function getDictionary(iso: string): WordCheck | null {
  const key = iso.toLowerCase();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  const pkg = SUPPORTED_LANGUAGES[key]?.dictionary;
  if (!pkg) {
    cache.set(key, null);
    return null;
  }

  try {
    const entry = require.resolve(pkg);
    const dir = dirname(entry);
    const spell = nspell(
      readFileSync(join(dir, "index.aff"), "utf8"),
      readFileSync(join(dir, "index.dic"), "utf8")
    );
    const check: WordCheck = (word) => spell.correct(word);
    cache.set(key, check);
    return check;
  } catch {
    cache.set(key, null);
    return null;
  }
}