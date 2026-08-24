/**
 * Loanword/brand handling for lang-leak-checker.
 *
 * Deciding which English-looking words are "accepted vocabulary" is done in
 * TWO layers:
 *
 * 1. SEED (`LOANWORDS`) — a small, stable bootstrap list for words that can't
 *    be learned reliably (brand/proper nouns that appear as lone elements).
 *    You should rarely need to touch this.
 *
 * 2. LEARNING (see detect.ts `learnAdoptedWords`) — during every scan, the
 *    detector watches foreign-reading elements and auto-adopts any word whose
 *    remainder reads Danish/ambiguous. New anglicisms are picked up from the
 *    site itself — no manual list maintenance.
 *
 * The strip-and-recheck rule is self-limiting: a word can only rescue an
 * element if everything LEFT OVER reads as the target language (its best
 * language is Danish). A genuinely English sentence — even one whose
 * best-language margin drops to ~0.6 under low-accuracy mode — is still
 * foreign and stays flagged. So auto-adopting a word can never hide a real
 * leak.
 */

// Bootstrap only. Dynamic adoption happens per-scan in detect.ts.
export const LOANWORDS = new Set([
  // proper-noun community term used on the site
  "community",
  // supermarket / coffee brands shown as lone elements
  "netto",
  "rema",
  "rema1000",
  "bki",
  "fakta",
  "coca",
  "cola",
]);

/** Unique alphabetic tokens of `text`, lowercased (handles æøå). */
export function alphaTokens(text: string): string[] {
  return Array.from(new Set(text.toLowerCase().match(/[a-zæøå]+/g) ?? []));
}

/**
 * Removes every token in `set` from `text`, keeping all other words,
 * whitespace and punctuation intact.
 */
export function stripTokens(text: string, set: ReadonlySet<string>): string {
  return text
    .split(/(\b)/)
    .map((part) => (set.has(part.toLowerCase()) ? "" : part))
    .join("");
}

/** Strips only the seed list (used as a convenience / in tests). */
export function stripLoanwords(text: string): string {
  return stripTokens(text, LOANWORDS);
}