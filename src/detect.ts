import { LanguageDetectorBuilder } from "../wasm/lingua_wasm.cjs";
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

export function detectLeaks(
  nodes: TextNode[],
  target: string,
  opts: { minLength: number }
): Leak[] {
  const targetLang = target === "da" ? "Danish" : "English";
  const leaks: Leak[] = [];

  for (const node of nodes) {
    if (node.text.length < opts.minLength) continue;

    // Returns [{language, value}, ...] sorted by value, highest first.
    const confidences = detector.computeLanguageConfidenceValues(
      node.text
    ) as Confidence[];
    const best = confidences[0];

    if (!best) continue;
    if (best.value < CONFIDENCE_THRESHOLD) continue; // slang/ambiguous → skip
    if (best.language === targetLang) continue;      // confident target → clean

    leaks.push({
      elementPath: node.elementPath,
      text: node.text,
      detected: best.language === "English" ? "eng" : "dan",
      confidence: best.value,
    });
  }
  return leaks;
}