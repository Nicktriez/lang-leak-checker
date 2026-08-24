import { readFileSync } from "node:fs";

/**
 * Language registry for lang-leak-checker.
 *
 * Two constraints shape this map:
 * - lingua compiles language models into the wasm at BUILD time (one feature
 *   per language, ~5MB each — all 75 would be ~288MB). Only languages present
 *   in `wasm/lingua_wasm.cjs` can actually be detected.
 * - official hunspell dictionaries (`dictionary-*` npm packages, same family
 *   as Firefox language packs) are per-language and loaded at runtime.
 *
 * To add a language: add it to the map below, add its feature in
 * `lingua-wasm/build.sh`, run `lingua-wasm/build.sh`, and commit the rebuilt
 * `wasm/` artifact. Languages mapped here but not compiled give a clear
 * "rebuild the detector" error at runtime.
 *
 * The detector always compares the TARGET language against ENGLISH (the usual
 * leak source). When the target IS English, it compares against Danish.
 */

export interface LanguageInfo {
  /** Name accepted by the lingua wasm bindings (e.g. "Polish"). */
  lingua: string;
  /** Optional npm package shipping the official hunspell dictionary. */
  dictionary?: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageInfo> = {
  da: { lingua: "Danish", dictionary: "dictionary-da" },
  en: { lingua: "English" },
  pl: { lingua: "Polish", dictionary: "dictionary-pl" },
  de: { lingua: "German", dictionary: "dictionary-de" },
  fr: { lingua: "French", dictionary: "dictionary-fr" },
  es: { lingua: "Spanish", dictionary: "dictionary-es" },
  it: { lingua: "Italian", dictionary: "dictionary-it" },
  nl: { lingua: "Dutch", dictionary: "dictionary-nl" },
  sv: { lingua: "Swedish", dictionary: "dictionary-sv" },
};

/** Listing of supported ISO codes for error messages. */
export const SUPPORTED_CODES = Object.keys(SUPPORTED_LANGUAGES).join(", ");

// Languages actually compiled into wasm/lingua_wasm (the single source of
// truth is lingua-wasm/build.sh, which emits this manifest).
function readCompiledLanguages(): Set<string> {
  try {
    const raw = readFileSync(new URL("../wasm/LANGUAGES.json", import.meta.url), "utf8");
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}
const COMPILED = readCompiledLanguages();

/** True when `linguaName` (e.g. "Polish") is compiled into the wasm artifact. */
export function isCompiled(linguaName: string): boolean {
  return COMPILED.has(linguaName);
}

/**
 * Resolves a CLI ISO-639-1 code to the lingua names for the target language
 * and the language it is compared against (English, or Danish when the target
 * is English).
 */
export function resolveLanguages(iso: string): {
  target: LanguageInfo;
  other: LanguageInfo;
} {
  const target = SUPPORTED_LANGUAGES[iso.toLowerCase()];
  if (!target) {
    throw new Error(
      `unsupported language '${iso}'. Supported codes: ${SUPPORTED_CODES}`
    );
  }
  if (!isCompiled(target.lingua)) {
    throw new Error(
      `language '${iso}' (${target.lingua}) is mapped but NOT compiled into the wasm detector. ` +
        `Rebuild it with: lingua-wasm/build.sh ${target.lingua.toLowerCase()}`
    );
  }
  const other: LanguageInfo =
    target.lingua === "English" ? { lingua: "Danish" } : { lingua: "English" };
  return { target, other };
}