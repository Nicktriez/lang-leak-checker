/**
 * Loanwords and brand names that are accepted in the site's UI.
 *
 * Rule (applied in detect.ts): an element that reads as a foreign language
 * ONLY because of these words is NOT a leak — the rest of the element must
 * read as the target language (or be ambiguous) for it to pass. A remainder
 * that confidently reads as a foreign language is still flagged.
 */
export const LOANWORDS = new Set([
    // anglicisms common in Danish web UIs
    "upload",
    "uploads",
    "uploaded",
    "uploading",
    "community",
    // supermarket / coffee brands shown on the site
    "netto",
    "rema",
    "rema1000",
    "bki",
    "fakta",
    "coca",
    "cola",
]);
/**
 * Removes every allowlisted loanword/brand token from `text`, keeping all
 * other words, whitespace and punctuation intact.
 */
export function stripLoanwords(text) {
    return text
        .split(/(\b)/)
        .map((part) => (LOANWORDS.has(part.toLowerCase()) ? "" : part))
        .join("");
}
