# lang-leak-checker

Find **untranslated / foreign "language leakages"** in HTML — element-level, in one pass.

Scans any file path or URL, and flags every inner element that *confidently* reads as the wrong language
(e.g. English copy left on a Danish site). It is element-level, not word-level: slang, loanwords and brand
names inside an otherwise-target-language element pass by design. Only an element that confidently reads as
the wrong language is flagged.

- Detection: **lingua** (compiled wasm language models)
- Official vocabulary: **hunspell dictionaries** (the same word lists Firefox ships as language packs)
- Plus per-scan **learning** for anglicisms the official dictionary hasn't adopted yet

---

## Install with pnpm

As a **devDependency** from the git URL:

```bash
pnpm add -D lang-leak-checker@github:Nicktriez/lang-leak-checker#main
```

It must live in `devDependencies`, not `dependencies` — that's the structural "never in production"
guarantee: production installs run `--omit=dev` and skip it entirely, while every dev machine and
coding agent gets it.

> npm users: `npm install --save-dev lang-leak-checker@git+https://github.com/Nicktriez/lang-leak-checker.git#main`

The git install ships the compiled `dist/` and the wasm detector, and pulls the needed language
dictionaries in automatically.

---

## Usage

```bash
# One-off scan (pnpm)
pnpm exec lang-leak-checker --language da https://beta.skujeg.dk/

# Multiple inputs (files and/or URLs)
pnpm exec lang-leak-checker --language da page1.html https://beta.skujeg.dk/leaderboard

# Machine-readable output (for agents / CI)
pnpm exec lang-leak-checker --language da --json https://beta.skujeg.dk/
```

### Options

| Flag | Meaning | Default |
| --- | --- | --- |
| `-l, --language <code>` | Target language, ISO 639-1 (`da`, `en`, `pl`, …) | **required** |
| `-m, --min-length <n>` | Skip text shorter than this | `3` |
| `--include-meta` | Also scan `<title>`/`<meta>` | off |
| `--include-hidden` | Also scan `script`/`style`/`svg` | off |
| `--json` | Machine-readable output | off |
| `--crawl` | Crawl the site from the given URL(s) with a headless browser | off |
| `--auth <file>` | Reuse a saved session (from `login`) — implies `--crawl` | — |
| `--max-pages <n>` | Max pages when crawling | `50` |
| `--exclude <selector>` | Skip elements matching this CSS selector, subtree included (repeatable) | — |

## Crawling a whole site

`--crawl` renders the start URL in headless Chromium and follows every same-origin link (up to
`--max-pages`, default 50) — no hand-listed routes needed, and client-side rendered content is
scanned too (plain `fetch` never sees it).

```bash
pnpm exec playwright install chromium   # once per machine (downloads the browser)
pnpm exec lang-leak-checker --language da --crawl http://localhost:3000/
```

### Authenticated pages

Log in **once** in a real browser window — the session (cookies/localStorage) is saved to a file
and reused by scans. Works with any auth flow (passkeys, magic links, OAuth) because you complete
the login manually; the tool never sees credentials.

```bash
pnpm exec lang-leak-checker login http://localhost:3000/login --save auth.json
pnpm exec lang-leak-checker --language da --auth auth.json --crawl http://localhost:3000/
```

> `auth.json` contains session cookies — treat it like a password: keep it local, add it to
> `.gitignore`.

### Excluding data regions

Product names, store names, and other data from a feed are not UI copy. Exclude the DOM regions
that hold them so the report stays about copy:

```bash
pnpm exec lang-leak-checker --language da --crawl https://example.com/ \
  --exclude "li.product-card" --exclude "#offer-grid"
```

Exclusion covers the matching element **and its entire subtree**.

### Exit codes (the whole CI/agent contract)

| Code | Meaning |
| --- | --- |
| `0` | clean — no leaks |
| `1` | leaks found |
| `2` | hard error (bad file/URL, unsupported or not-compiled language) |

---

## As a project script (pnpm)

Add to `package.json`:

```json
"scripts": {
  "leak-check": "lang-leak-checker --language da $URL"
}
```

Then:

```bash
# ✅ pnpm: pass flags BEFORE "--" — no "--" needed
pnpm run leak-check --language da --json https://beta.skujeg.dk/

# ✅ plain URL also works (commander treats "--" as end-of-options)
pnpm run leak-check -- https://beta.skujeg.dk/
```

> ⚠️ **pnpm forwards `--` literally.** `pnpm run leak-check -- --language da …` puts `--language`
> into the *positional args* and the tool tries to open a file named `--language` (exit 2).
> Put flags *before* `--`, or skip `--` entirely with pnpm.
>
> npm behaves differently — it strips the `--`:
> `npm run leak-check -- --language da --json https://beta.skujeg.dk/`

---

## Language support & adding your language

Models are compiled into the wasm artifact at **build time** (each language ≈ 5 MB; all 75 of lingua's
languages would be ≈ 288 MB). Two tiers exist:

**Compiled** (present in the shipped `wasm/`, usable right now):
`da` Danish, `en` English, `pl` Polish

**Mapped but not compiled** (`de`, `fr`, `es`, `it`, `nl`, `sv`): accepted codes, but on use the tool
tells you to rebuild before they can detect.

To add a language, three steps, then commit the artifact:

```bash
# 1. rebuild the wasm with the languages you want (in lingua-wasm/)
cd lingua-wasm && ./build.sh polish german french

# 2. add the ISO code to the SUPPORTED_LANGUAGES map in src/languages.ts
#    (one line; the official hunspell dictionary package resolves automatically
#     — dictionary-pl, dictionary-de, …)

# 3. commit the rebuilt wasm/ + LANGUAGES.json manifest
```

The detector always compares the target language against **English** (the usual leak source); when the
target *is* English it compares against Danish.

> Why a custom wasm build and not the `lingua-node` npm package? `lingua-node` doesn't bundle the
> language models, and compiling all 75 models is ≈288 MB. Building our own artifact with a curated set
> keeps the shipped package ≈17 MB while still giving full accuracy for those languages.

---

## How loanwords are handled

Three layers, most-authoritative first:

1. **Official dictionary** — words in the target language's hunspell dictionary are by definition the
   language, adopted loanwords included (`upload` is official Danish, `komputer` is official Polish).
   lingua would read both as English; the dictionary knows better.
2. **Per-scan learning** — words a site uses inside otherwise-target-language elements get adopted
   automatically (e.g. a nav item `Upload kvittering`).
3. **Seed** — a tiny bootstrap list for brand/proper nouns (`bki`, `rema`).

The rule is self-limiting: a word can only rescue an element if everything *left over* still reads as the
target language. A genuinely English sentence stays English no matter which word you strip — so real leaks
are never hidden by the dictionary or the learning.

---

## Development (this repo)

This repo is **npm-managed** (`package-lock.json`); use npm here. (Consumers install it from git with pnpm —
see “Install with pnpm”. If you prefer pnpm in this repo: `rm -rf node_modules package-lock.json`,
then `pnpm install` — `pnpm.onlyBuiltDependencies` in package.json approves esbuild for pnpm.)

```bash
npm run dev     # tsx, instant feedback
npm run build   # tsc → dist/
npm test        # node --test (Node 26 requires the glob form, not a dir arg)
```