import { LanguageDetectorBuilder } from "../wasm/lingua_wasm.cjs";
const detector = LanguageDetectorBuilder
    .fromLanguages("Danish", "English")
    .withLowAccuracyMode() // plenty for da/en, faster
    .build();
const CONFIDENCE_THRESHOLD = 0.9;
export function detectLeaks(nodes, target, opts) {
    const targetLang = target === "da" ? "Danish" : "English";
    const leaks = [];
    for (const node of nodes) {
        if (node.text.length < opts.minLength)
            continue;
        // Returns [{language, value}, ...] sorted by value, highest first.
        const confidences = detector.computeLanguageConfidenceValues(node.text);
        const best = confidences[0];
        if (!best)
            continue;
        if (best.value < CONFIDENCE_THRESHOLD)
            continue; // slang/ambiguous → skip
        if (best.language === targetLang)
            continue; // confident target → clean
        leaks.push({
            elementPath: node.elementPath,
            text: node.text,
            detected: best.language === "English" ? "eng" : "dan",
            confidence: best.value,
        });
    }
    return leaks;
}
