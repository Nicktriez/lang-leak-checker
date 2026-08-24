import { LanguageDetectorBuilder } from "../wasm/lingua_wasm.cjs";
import { getDictionary } from "./language-dict.js";
import { resolveLanguages } from "./languages.js";
import { LOANWORDS, alphaTokens, stripTokens } from "./loanwords.js";
import type { TextNode } from "./scan.js";

export interface Leak {
  elementPath: string;
  text: string;
  detected: string; // "eng" or "dan" (target vs other, 3-letter codes)
  confidence: number;
}

const CONFIDENCE_THRESHOLD = 0.9;
const detectorCache = new Map<string, DetectorLike>();

/** The piece of the wasm binding we use. */
interface DetectorLike {
  computeLanguageConfidenceValues(text: string): unknown;
}

/**
 * Builds (once, per pair) a lingua detector comparing the target language
 * against the other language. Throws with a rebuild hint when the target is
 * mapped but not compiled into the wasm artifact.
 */
function getDetector(target: string, other: string): DetectorLike {
  const key = `${target}|${other}`;
  const cached = detectorCache.get(key);
  if (cached) return cached;
  try {
    const detector = LanguageDetectorBuilder.fromLanguages(target, other)
      .withLowAccuracyMode()
      .build();
    detectorCache.set(key, detector);
    return detector;
  } catch {
    throw new Error(
      `language '${target}' is not compiled into the wasm detector — rebuild it with: lingua-wasm/build.sh (and add '${target}' to src/languages.ts if needed)`
    );
  }
}

type Confidence = { language: string; value: number };

/** Best (highest-confidence) language for `text`, or undefined if none. */
function bestOf(detector: DetectorLike, text: string): Confidence | undefined {
  const best = (detector.computeLanguageConfidenceValues(text) as Confidence[])[0];
  // Confidence 0 (no letters, empty remainders, numbers only) = no opinion.
  return best && best.value > 0 ? best : undefined;
}

/**
 * Learns adopted loanwords/brands from the scanned elements themselves.
 *
 * For every element that reads confidently as a foreign language, it strips
 * each word in turn and re-detects the rest. A word whose remainder reads as
 * the target language — whatever the confidence — is being used as accepted
 * vocabulary at this site, so it earns an "adopt" vote. A remainder that
 * leans foreign (lingua's low-accuracy mode can drop to ~0.6 on short text)
 * makes the word earn a "keep" vote — otherwise a single strong English word
 * like "welcome" would wrongly adopt. Adopted only when adopt votes
 * outnumber keep votes.
 *
 * This is safe because adoption can only rescue an element whose remainder
 * reads as the target language — a genuinely foreign sentence stays foreign
 * no matter which word you strip.
 */
export function learnAdoptedWords(
  nodes: TextNode[],
  targetIso: string,
  minLength: number
): Set<string> {
  const { target, other } = resolveLanguages(targetIso);
  const detector = getDetector(target.lingua, other.lingua);
  const votes = new Map<string, number>(); // +1 adopt, -1 keep

  for (const node of nodes) {
    if (node.text.length < minLength) continue;

    const best = bestOf(detector, node.text);
    if (!best || best.value < CONFIDENCE_THRESHOLD || best.language === target.lingua) continue;

    const tokens = alphaTokens(node.text);
    if (tokens.length < 2) continue; // lone words can't teach us

    for (const token of tokens) {
      const rest = bestOf(
        detector,
        stripTokens(node.text, (p) => p.toLowerCase() === token)
      );
      // Adopt only when the rest's BEST language is the target. An empty rest
      // or a target-leaning rest means the word is carrying the foreign read
      // alone. A foreign-leaning rest at any confidence means the rest is real
      // foreign text → keep the word flagged.
      const adopt = !rest || rest.language === target.lingua;
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
  targetIso: string,
  opts: { minLength: number },
  allowlist?: ReadonlySet<string>
): Leak[] {
  const { target, other } = resolveLanguages(targetIso);
  const detector = getDetector(target.lingua, other.lingua);
  const targetLang = target.lingua;
  const set =
    allowlist ??
    new Set([...LOANWORDS, ...learnAdoptedWords(nodes, targetIso, opts.minLength)]);
  const dictionary = getDictionary(targetIso);

  // A word is allowed if it is an official dictionary word of the target
  // language (e.g. "upload" is in the Danish dictionary; "komputer" in the
  // Polish one) OR it is in the learned/seed list. Dictionary words are only
  // ever consulted after a foreign read, and can only rescue elements whose
  // remainder still reads as the target language.
  const allowed = (part: string) => {
    if (!/^\p{L}+$/u.test(part)) return false; // skip whitespace/punct
    return (dictionary !== null && dictionary(part)) || set.has(part.toLowerCase());
  };

  const leaks: Leak[] = [];

  for (const node of nodes) {
    if (node.text.length < opts.minLength) continue;

    const best = bestOf(detector, node.text);

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
      const clean = bestOf(detector, stripped);
      if (!clean || clean.language === targetLang) {
        continue;
      }
    }

    leaks.push({
      elementPath: node.elementPath,
      text: node.text,
      detected: best.language, // lingua name, e.g. "English", "Polish"
      confidence: best.value,
    });
  }
  return leaks;
}