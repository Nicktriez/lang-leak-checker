/**
 * Loanword/brand handling for lang-leak-checker.
 *
 * Deciding which English-looking words are "accepted vocabulary" is done in
 * THREE layers, most-authoritative first:
 *
 * 1. DICTIONARY (see danish-dict.ts) — the official Danish hunspell word list.
 *    Anything in it IS Danish, adopted loanwords included ("computer",
 *    "weekend", "upload"). This is the primary source of truth.
 *
 * 2. LEARNING (see detect.ts `learnAdoptedWords`) — during every scan, the
 *    detector watches foreign-reading elements and auto-adopts any word whose
 *    remainder reads Danish. Catches site-specific anglicisms not yet in the
 *    official dictionary.
 *
 * 3. SEED (`LOANWORDS`) — a tiny bootstrap list for brand names and terms
 *    that can never be dictionary words or context-learned ("bki", "rema").
 *
 * The strip-and-recheck rule is self-limiting: a word can only rescue an
 * element if everything LEFT OVER reads as the target language (its best
 * language is Danish). A genuinely English sentence — even one whose
 * best-language margin drops to ~0.6 under low-accuracy mode — is still
 * foreign and stays flagged. So no layer can ever hide a real leak.
 */

// Bootstrap only. The dictionary + learning layers do the real work.
export const LOANWORDS = new Set([
  // brand names (coca/cola/netto/fakta are already official Danish words)
  "bki",
  "rema",
  "rema1000",
  // community term in use on the site (capitalised proper noun)
  "community",
]);

/** Unique alphabetic tokens of `text`, lowercased (any script). */
export function alphaTokens(text: string): string[] {
  return Array.from(new Set(text.toLowerCase().match(/\p{L}+/gu) ?? []));
}

/**
 * Removes every part for which `allowed` returns true, keeping all other
 * words, whitespace and punctuation intact.
 */
export function stripTokens(text: string, allowed: (part: string) => boolean): string {
  return text
    .split(/(\b)/)
    .map((part) => (allowed(part) ? "" : part))
    .join("");
}

/** Strips only the seed list (used as a convenience / in tests). */
export function stripLoanwords(text: string): string {
  return stripTokens(text, (part) => LOANWORDS.has(part.toLowerCase()));
}