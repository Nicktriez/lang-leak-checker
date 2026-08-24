import { LanguageDetectorBuilder } from "../wasm/lingua_wasm.cjs";
import { isDanishDictionaryWord } from "./danish-dict.js";
import { LOANWORDS, alphaTokens, stripTokens } from "./loanwords.js";
import type { TextNode } from "./scan.js";

export interface Leak {
  elementPath: string;
  text: string;
  detected: string; // "eng" or "dan"
  confidence: number;
}

const detector = LanguageDetectorBuilder
  .fromLanguages("Danish", "English")
  .withLowAccuracyMode() // plenty for da/en, faster
  .build();

const CONFIDENCE_THRESHOLD = 0.9;

type Confidence = { language: string; value: number };

/** Best (highest-confidence) language for `text`, or undefined if none. */
function bestOf(text: string): Confidence | undefined {
  return (detector.computeLanguageConfidenceValues(text) as Confidence[])[0];
}

/** Maps a CLI ISO-639-1 code to the lingua name used internally. */
export function targetLanguageName(target: string): string {
  return target === "da" ? "Danish" : "English";
}

/**
 * Learns adopted loanwords/brands from the scanned elements themselves.
 *
 * For every element that reads confidently as a foreign language, it strips
 * each word in turn and re-detects the rest. A word whose remainder reads as
 * the target language — whatever the confidence — is being used as accepted
 * vocabulary at this site, so it earns an "adopt" vote. A remainder that
 * leans foreign (lingua's low-accuracy mode can drop to ~0.6 on short text)
 * keeps the word earn a "keep" vote — otherwise a single strong English word
 * like "welcome" would wrongly adopt. Adopted only when adopt votes
 * outnumber keep votes.
 *
 * This is safe because adoption can only rescue an element whose remainder
 * reads Danish/ambiguous — a genuinely English sentence stays English no
 * matter which word you strip.
 */
export function learnAdoptedWords(
  nodes: TextNode[],
  target: string, // lingua name, e.g. "Danish"
  minLength: number
): Set<string> {
  const votes = new Map<string, number>(); // +1 adopt, -1 keep

  for (const node of nodes) {
    if (node.text.length < minLength) continue;

    const best = bestOf(node.text);
    if (!best || best.value < CONFIDENCE_THRESHOLD || best.language === target) continue;

    const tokens = alphaTokens(node.text);
    if (tokens.length < 2) continue; // lone words can't teach us ("Leaderboard" vs "Upload")

    for (const token of tokens) {
      const rest = bestOf(stripTokens(node.text, (p) => p.toLowerCase() === token));
      // Adopt only when the rest's BEST language is the target. An empty rest
      // or a Danish-leaning rest (like "kvittering" at 0.57) means the word is
      // carrying the foreign read alone. A foreign-leaning rest at any
      // confidence means the rest is real foreign text → keep the word flagged.
      const adopt = !rest || rest.language === target;
      votes.set(token, (votes.get(token) ?? 0) + (adopt ? 1 : -1));
    }
  }

  const adopted = new Set<string>();
  for (const [token, score] of votes) {
    if (score > 0) adopted.add(token);
  }
  return adopted;
}

/**
 * Flags elements that confidently read as the wrong language.
 *
 * `allowlist` is optional: when provided (e.g. the CLI learns once across all
 * pages), it replaces the per-call learning so the whole scan is consistent.
 * Otherwise the loanwords are learned from the given nodes.
 */
export function detectLeaks(
  nodes: TextNode[],
  target: string,
  opts: { minLength: number },
  allowlist?: ReadonlySet<string>
): Leak[] {
  const targetLang = targetLanguageName(target);
  const set =
    allowlist ??
    new Set([...LOANWORDS, ...learnAdoptedWords(nodes, targetLang, opts.minLength)]);

  // A word is allowed if it is an official Danish dictionary word OR it is in
  // the learned/seed list. This makes the Danish hunspell dictionary the
  // primary source of truth — officially adopted loanwords pass even when
  // lingua confidently reads them as English.
  const allowed = (part: string) => {
    if (!/^[a-zæøå]+$/i.test(part)) return false; // skip whitespace/punct
    return isDanishDictionaryWord(part) || set.has(part.toLowerCase());
  };

  const leaks: Leak[] = [];

  for (const node of nodes) {
    if (node.text.length < opts.minLength) continue;

    // Returns [{language, value}, ...] sorted by value, highest first.
    const best = bestOf(node.text);

    if (!best) continue;
    if (best.value < CONFIDENCE_THRESHOLD) continue; // slang/ambiguous → skip
    if (best.language === targetLang) continue;      // confident target → clean

    // Loanword/brand pass: if the foreign read comes only from allowed words
    // (official dictionary words + learned/seed), re-detect the remainder.
    // It passes only when the remainder's BEST language is the target (or the
    // remainder is empty) — a remainder that leans any amount toward foreign
    // is still real foreign text.
    const stripped = stripTokens(node.text, allowed);
    if (stripped !== node.text) {
      const clean = bestOf(stripped);
      if (!clean || clean.language === targetLang) {
        continue;
      }
    }

    leaks.push({
      elementPath: node.elementPath,
      text: node.text,
      detected: best.language === "English" ? "eng" : "dan",
      confidence: best.value,
    });
  }
  return leaks;
}