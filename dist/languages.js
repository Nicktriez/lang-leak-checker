import { readFileSync } from "node:fs";
export const SUPPORTED_LANGUAGES = {
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
function readCompiledLanguages() {
    try {
        const raw = readFileSync(new URL("../wasm/LANGUAGES.json", import.meta.url), "utf8");
        return new Set(JSON.parse(raw));
    }
    catch {
        return new Set();
    }
}
const COMPILED = readCompiledLanguages();
/** True when `linguaName` (e.g. "Polish") is compiled into the wasm artifact. */
export function isCompiled(linguaName) {
    return COMPILED.has(linguaName);
}
/**
 * Resolves a CLI ISO-639-1 code to the lingua names for the target language
 * and the language it is compared against (English, or Danish when the target
 * is English).
 */
export function resolveLanguages(iso) {
    const target = SUPPORTED_LANGUAGES[iso.toLowerCase()];
    if (!target) {
        throw new Error(`unsupported language '${iso}'. Supported codes: ${SUPPORTED_CODES}`);
    }
    if (!isCompiled(target.lingua)) {
        throw new Error(`language '${iso}' (${target.lingua}) is mapped but NOT compiled into the wasm detector. ` +
            `Rebuild it with: lingua-wasm/build.sh ${target.lingua.toLowerCase()}`);
    }
    const other = target.lingua === "English" ? { lingua: "Danish" } : { lingua: "English" };
    return { target, other };
}
