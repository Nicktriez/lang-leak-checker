/* @ts-self-types="./lingua_wasm.d.ts" */

/**
 * This class detects the language of given input text.
 */
class LanguageDetector {
    static __wrap(ptr) {
        const obj = Object.create(LanguageDetector.prototype);
        obj.__wbg_ptr = ptr;
        LanguageDetectorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LanguageDetectorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_languagedetector_free(ptr, 0);
    }
    /**
     * Computes the confidence value for the given language and input text. This value denotes
     * how likely it is that the given text has been written in the given language.
     *
     * The value that this method computes is a number between 0.0 and 1.0. If the language is
     * unambiguously identified by the rule engine, the value 1.0 will always be returned.
     * If the given language is not supported by this detector instance, the value 0.0 will
     * always be returned.
     * @param {string} text
     * @param {string} language
     * @returns {number}
     */
    computeLanguageConfidence(text, language) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(language, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetector_computeLanguageConfidence(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0];
    }
    /**
     * Computes confidence values for each language supported by this detector for the given
     * input text. These values denote how likely it is that the given text has been written
     * in any of the languages supported by this detector.
     *
     * An array of two-element objects is returned containing those languages which the
     * calling instance of `LanguageDetector` has been built from, together with their
     * confidence values. The entries are sorted by their confidence value in descending order.
     * Each value is a probability between 0.0 and 1.0. The probabilities of all languages will
     * sum to 1.0. If the language is unambiguously identified by the rule engine, the value
     * 1.0 will always be returned for this language. The other languages will receive a value
     * of 0.0.
     * @param {string} text
     * @returns {any}
     */
    computeLanguageConfidenceValues(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetector_computeLanguageConfidenceValues(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Detects the language of given input text.
     * If the language cannot be reliably detected, `undefined` is returned.
     * @param {string} text
     * @returns {string | undefined}
     */
    detectLanguageOf(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetector_detectLanguageOf(this.__wbg_ptr, ptr0, len0);
        let v2;
        if (ret[0] !== 0) {
            v2 = getStringFromWasm0(ret[0], ret[1]);
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v2;
    }
    /**
     * Attempts to detect multiple languages in mixed-language text.
     *
     * This feature is experimental and under continuous development.
     *
     * An array of `DetectionResult` is returned containing an entry for each contiguous
     * single-language text section as identified by the library. Each entry consists
     * of the identified language, a start index and an end index. The indices denote
     * the substring that has been identified as a contiguous single-language text section.
     * @param {string} text
     * @returns {any}
     */
    detectMultipleLanguagesOf(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetector_detectMultipleLanguagesOf(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
}
if (Symbol.dispose) LanguageDetector.prototype[Symbol.dispose] = LanguageDetector.prototype.free;
exports.LanguageDetector = LanguageDetector;

/**
 * This class configures and creates an instance of `LanguageDetector`.
 */
class LanguageDetectorBuilder {
    static __wrap(ptr) {
        const obj = Object.create(LanguageDetectorBuilder.prototype);
        obj.__wbg_ptr = ptr;
        LanguageDetectorBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LanguageDetectorBuilderFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_languagedetectorbuilder_free(ptr, 0);
    }
    /**
     * Creates and returns the configured instance of `LanguageDetector`.
     * @returns {LanguageDetector}
     */
    build() {
        const ret = wasm.languagedetectorbuilder_build(this.__wbg_ptr);
        return LanguageDetector.__wrap(ret);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder` with all built-in languages.
     * @returns {LanguageDetectorBuilder}
     */
    static fromAllLanguages() {
        const ret = wasm.languagedetectorbuilder_fromAllLanguages();
        return LanguageDetectorBuilder.__wrap(ret);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with all built-in languages supporting the Arabic script.
     * @returns {LanguageDetectorBuilder}
     */
    static fromAllLanguagesWithArabicScript() {
        const ret = wasm.languagedetectorbuilder_fromAllLanguagesWithArabicScript();
        return LanguageDetectorBuilder.__wrap(ret);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with all built-in languages supporting the Cyrillic script.
     * @returns {LanguageDetectorBuilder}
     */
    static fromAllLanguagesWithCyrillicScript() {
        const ret = wasm.languagedetectorbuilder_fromAllLanguagesWithCyrillicScript();
        return LanguageDetectorBuilder.__wrap(ret);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with all built-in languages supporting the Devanagari script.
     * @returns {LanguageDetectorBuilder}
     */
    static fromAllLanguagesWithDevanagariScript() {
        const ret = wasm.languagedetectorbuilder_fromAllLanguagesWithDevanagariScript();
        return LanguageDetectorBuilder.__wrap(ret);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with all built-in languages supporting the Latin script.
     * @returns {LanguageDetectorBuilder}
     */
    static fromAllLanguagesWithLatinScript() {
        const ret = wasm.languagedetectorbuilder_fromAllLanguagesWithLatinScript();
        return LanguageDetectorBuilder.__wrap(ret);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with all built-in languages except those specified in `languages`.
     *
     * ⚠ Throws an error if no language is specified.
     * @param {...any[]} languages
     * @returns {LanguageDetectorBuilder}
     */
    static fromAllLanguagesWithout(...languages) {
        const ptr0 = passArrayJsValueToWasm0(languages, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetectorbuilder_fromAllLanguagesWithout(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LanguageDetectorBuilder.__wrap(ret[0]);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with all built-in spoken languages.
     * @returns {LanguageDetectorBuilder}
     */
    static fromAllSpokenLanguages() {
        const ret = wasm.languagedetectorbuilder_fromAllSpokenLanguages();
        return LanguageDetectorBuilder.__wrap(ret);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with the languages specified by the respective ISO 639-1 codes.
     *
     * ⚠ Throws an error if no ISO code is specified.
     * @param {...any[]} isoCodes
     * @returns {LanguageDetectorBuilder}
     */
    static fromISOCodes6391(...isoCodes) {
        const ptr0 = passArrayJsValueToWasm0(isoCodes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetectorbuilder_fromISOCodes6391(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LanguageDetectorBuilder.__wrap(ret[0]);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with the languages specified by the respective ISO 639-3 codes.
     *
     * ⚠ Throws an error if no ISO code is specified.
     * @param {...any[]} isoCodes
     * @returns {LanguageDetectorBuilder}
     */
    static fromISOCodes6393(...isoCodes) {
        const ptr0 = passArrayJsValueToWasm0(isoCodes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetectorbuilder_fromISOCodes6393(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LanguageDetectorBuilder.__wrap(ret[0]);
    }
    /**
     * Creates and returns an instance of `LanguageDetectorBuilder`
     * with the specified `languages`.
     *
     * ⚠ Throws an error if no language is specified.
     * @param {...any[]} languages
     * @returns {LanguageDetectorBuilder}
     */
    static fromLanguages(...languages) {
        const ptr0 = passArrayJsValueToWasm0(languages, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.languagedetectorbuilder_fromLanguages(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LanguageDetectorBuilder.__wrap(ret[0]);
    }
    /**
     * Disables the high accuracy mode in order to save memory and increase performance.
     *
     * By default, *Lingua's* high detection accuracy comes at the cost of loading large
     * language models into memory which might not be feasible for systems running low on
     * resources.
     *
     * This method disables the high accuracy mode so that only a small subset of language
     * models is loaded into memory. The downside of this approach is that detection accuracy
     * for short texts consisting of less than 120 characters will drop significantly. However,
     * detection accuracy for texts which are longer than 120 characters will remain mostly
     * unaffected.
     * @returns {LanguageDetectorBuilder}
     */
    withLowAccuracyMode() {
        const ret = wasm.languagedetectorbuilder_withLowAccuracyMode(this.__wbg_ptr);
        return LanguageDetectorBuilder.__wrap(ret);
    }
    /**
     * Sets the desired value for the minimum relative distance measure.
     *
     * By default, *Lingua* returns the most likely language for a given
     * input text. However, there are certain words that are spelled the
     * same in more than one language. The word *prologue*, for instance,
     * is both a valid English and French word. Lingua would output either
     * English or French which might be wrong in the given context.
     * For cases like that, it is possible to specify a minimum relative
     * distance that the logarithmized and summed up probabilities for
     * each possible language have to satisfy.
     *
     * Be aware that the distance between the language probabilities is
     * dependent on the length of the input text. The longer the input
     * text, the larger the distance between the languages. So if you
     * want to classify very short text phrases, do not set the minimum
     * relative distance too high. Otherwise, you will get most results
     * returned as `undefined` which is the return value for cases
     * where language detection is not reliably possible.
     *
     * ⚠ Throws an error if `distance` is smaller than 0.0 or greater than 0.99.
     * @param {number} distance
     * @returns {LanguageDetectorBuilder}
     */
    withMinimumRelativeDistance(distance) {
        const ret = wasm.languagedetectorbuilder_withMinimumRelativeDistance(this.__wbg_ptr, distance);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LanguageDetectorBuilder.__wrap(ret[0]);
    }
    /**
     * Configures `LanguageDetectorBuilder` to preload all language models when creating
     * the instance of `LanguageDetector`.
     *
     * By default, *Lingua* uses lazy-loading to load only those language models
     * on demand which are considered relevant by the rule-based filter engine.
     * For web services, for instance, it is rather beneficial to preload all language
     * models into memory to avoid unexpected latency while waiting for the
     * service response. This method allows to switch between these two loading modes.
     * @returns {LanguageDetectorBuilder}
     */
    withPreloadedLanguageModels() {
        const ret = wasm.languagedetectorbuilder_withPreloadedLanguageModels(this.__wbg_ptr);
        return LanguageDetectorBuilder.__wrap(ret);
    }
}
if (Symbol.dispose) LanguageDetectorBuilder.prototype[Symbol.dispose] = LanguageDetectorBuilder.prototype.free;
exports.LanguageDetectorBuilder = LanguageDetectorBuilder;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_408e67f47ca7b58b: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        },
        __wbg___wbindgen_debug_string_a57024b9c6e4a48b: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_string_get_d154f1e671052120: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_bb96b2010945f0bc: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_new_116be93542d39019: function() {
            const ret = new Array();
            return ret;
        },
        __wbg_new_ebe3e0f6837f0879: function() {
            const ret = new Object();
            return ret;
        },
        __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        },
        __wbg_set_a80955eb93b145c6: function(arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        },
        __wbindgen_cast_0000000000000001: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_cast_0000000000000003: function(arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./lingua_wasm_bg.js": import0,
    };
}

const LanguageDetectorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_languagedetector_free(ptr, 1));
const LanguageDetectorBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_languagedetectorbuilder_free(ptr, 1));

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
function decodeText(ptr, len) {
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

const wasmPath = `${__dirname}/lingua_wasm_bg.wasm`;
const wasmBytes = require('fs').readFileSync(wasmPath);
const wasmModule = new WebAssembly.Module(wasmBytes);
let wasmInstance = new WebAssembly.Instance(wasmModule, __wbg_get_imports());
let wasm = wasmInstance.exports;
wasm.__wbindgen_start();
