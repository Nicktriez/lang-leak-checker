# Language Leak Checker — TypeScript Learning Tasks

A hands-on TypeScript course built around a real project: a CLI that scans a website and flags every inner HTML element that isn't in the chosen language — and, critically, the **agent-workflow** tool that makes AI coding agents fix English leakage in one go.

**Your goal:** learn TypeScript and how to build & distribute a JS dependency ("gem") *by building this actual tool.* Not toy examples — a tool that does a real job and ships as a devDependency.

## How to use these tasks
- Do them **in order**. Each builds on the last.
- **Write the code yourself** — the snippets are a guide, not a copy-paste answer. If you copy without typing, you won't learn. Read the "Read this — the concepts" sections *before* moving on.
- Each task ends with **"Check you understand"** — self-assess honestly. If you can't answer one, re-read the task before proceeding.
- **Commit after every task.** Small commits = you can rewind when something breaks.
- When you get stuck: read the error, understand it, then ask Ultron. The error messages are teaching tools.

## Prerequisites
- Node ≥ 20 (`node --version`)
- A GitHub account + a repo `Nicktriez/lang-leak-checker`
- **Optional:** Rust toolchain (only for the one-time lingua-wasm build in Task 6 — or ask Ultron to do that build)

## The task list

| # | Title | What you learn | Builds on |
|---|---|---|---|
| 00 | `package.json` + ESM | What a JS package is, `dependencies` vs `devDependencies`, `type: module` | — |
| 01 | `tsconfig.json` + strict | What TypeScript does, `strict`, `tsc` vs `tsx` | 00 |
| 02 | Types, interfaces, CLI | `interface`, type annotations, `commander`, shebang | 01 |
| 03 | Async, `fetch`, load | `async`/`await`, `Promise`, union types, ESM `.js` imports | 02 |
| 04 | cheerio, DOM walk | The DOM, `Set`, arrays, `as`/`?.`/`??` | 03 |
| 05 | Detector logic | `Leak` interface, filter pipeline, `interface` vs `type` | 04 |
| 06 | lingua-wasm | Real detector, wasm artifact, `Object.entries`+`sort` | 05 |
| 07 | Report + pipeline | Template literals, `void`, exit codes, composing modules | 06 |
| 08 | Testing (TDD) | Node test runner, `it()`/`assert`, fixtures, pure functions | 07 |
| 09 | Packaging | `main`/`bin`/`files`, `npm pack`, `npm link` | 08 |
| 10 | Distribution | `git+https` devDependency, `npm run` alias, AGENTS.md agent gate | 09 |

## The concept map (Rails → TypeScript)

| You know from Rails | TypeScript equivalent |
|---|---|
| `Gemfile` / `Gemfile.lock` | `package.json` / `package-lock.json` |
| `vendor/bundle` | `node_modules/` |
| Bundler | npm |
| `gem 'x', group: :development` | `devDependencies` |
| `gem 'x', git: '...'` | `"x": "git+https://..."` |
| gemspec `files` | `package.json` `files` |
| `bundle exec rake task` | `npm run <script>` |
| Nokogiri | `cheerio` |
| strong parameters / schema | `interface` / types |
| RSpec / minitest | `node --test` + `assert` |

## Two habits worth building now
1. **Let strict mode fight you.** Every red squiggle is TypeScript catching a real edge case (a value that might be `undefined`). Fix it properly; don't suppress it.
2. **Read the error before asking for help.** The TS compiler writes specific, readable errors. Try to fix it yourself first — that's where the learning happens.

Good luck. When you finish Task 10, you'll have: a working TypeScript tool, a real JS dependency, an understanding of the module/type system, and an AI-agent workflow that actually enforces Danish consistency.
