# Language Leak Checker — TypeScript Learning Tasks

A hands-on TypeScript course built around a real project: a CLI that scans a website and flags every inner HTML element that isn't in the chosen language — and, critically, the **agent-workflow** tool that makes AI coding agents fix English leakage in one go.

**Your goal:** learn TypeScript and how to build & distribute a JS dependency ("gem") *by building this actual tool.* Not toy examples — a tool that does a real job and ships as a devDependency.

## Before you start — the fundamentals (read this even if it feels basic)

If any of this is new, read it slowly. It's the ground everything else stands on.

### What is a terminal?
The **terminal** (also "command line" / "shell") is a text box where you type commands and the computer runs them. You type a command, press Enter, the computer does it and prints results. Commands you'll use constantly:
- `pwd` — "print working directory" — where am I?
- `ls` — "list" — what files are here?
- `cd <folder>` — "change directory" — go into a folder.
- `mkdir <name>` — "make directory" — create a folder.

When you see `cd /root/lang-leak-checker`, it means "go into that folder." Commands in this course are copy-paste ready — you type them in the terminal and press Enter.

### What is a program? What is a variable? What is a function?
A **program** is a list of instructions the computer runs top to bottom.
A **variable** is a named box that holds a value: `const name = "Nick"` makes a box called `name` holding `"Nick"`.
A **function** is a reusable chunk of instructions with a name. You *call* (use) it: `printTty(results)`. Like a Ruby method.

**You already know these from Rails.** If a term appears and you're unsure, treat it like the Rails equivalent (the table at the bottom of this page maps them).

### What is Node? What is npm?
- **Node** is the thing that *runs* JavaScript outside a browser. Your Rails app runs on Ruby; this tool runs on Node.
- **npm** ("node package manager") is like Bundler. It downloads and installs other people's code ("packages") into your project. `npm install cheerio` downloads the cheerio package. The downloaded code goes in a `node_modules/` folder.

### What does TypeScript "compile" mean?
TypeScript is JavaScript with extra safety (types). But Node doesn't understand TypeScript — it understands plain JavaScript. **Compiling** = converting TypeScript → JavaScript so Node can run it. The command `npm run build` does this. TypeScript's types are *for you and the compiler* — they vanish in the compiled output.

### What is a "dependency"?
A **dependency** is a package your project relies on. If your tool uses cheerio, cheerio is a dependency. `dependencies` = things needed to *run*. `devDependencies` = things only needed to *build/test/develop* (like Rails' `group :development`).

### "You'll see this error" — common ones for novices
| Error | What it means | Fix |
|---|---|---|
| `command not found` | You typed a command that isn't installed, or a typo | Check spelling; install the tool |
| `Cannot use import statement outside a module` | Node thinks your file is CommonJS but it's using `import` | `type: module` in package.json |
| `is not a function` | Called something that isn't callable — often a missing import | Check the import path |
| TypeScript `Property X does not exist` | You used a field that isn't on the type | Check the interface — you missed a field or typo'd it |
| `Cannot find module './fetch'` | Wrong import path | In ESM you import `./fetch.js` not `./fetch` |

## How to use these tasks
- Do them **in order**. Each builds on the last.
- **Write the code yourself** — the snippets are a guide, not a copy-paste answer. If you copy without typing, you won't learn. Read the "Read this — the concepts" sections *before* moving on.
- Each task ends with **"Check you understand"** — self-assess honestly. If you can't answer one, re-read the task before proceeding.
- **Commit after every task.** Small commits = you can rewind when something breaks.
- When you get stuck: read the error, understand it, then ask Ultron. The error messages are teaching tools.
- **Terms are defined the first time they appear.** If you hit one you don't recognize, look back — it was explained earlier.

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
| Ruby method | function |
| Ruby variable | `const` / `let` |
| Ruby `nil || default` | `??` (nullish coalescing) |
| Ruby `nil.method?` guards | `?.` (optional chaining) |

## Two habits worth building now
1. **Let strict mode fight you.** Every red squiggle is TypeScript catching a real edge case (a value that might be `undefined`). Fix it properly; don't suppress it.
2. **Read the error before asking for help.** The TS compiler writes specific, readable errors. Try to fix it yourself first — that's where the learning happens.

Good luck. When you finish Task 10, you'll have: a working TypeScript tool, a real JS dependency, an understanding of the module/type system, and an AI-agent workflow that actually enforces Danish consistency.
