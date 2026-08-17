# Task 0 — Repo setup, Node, and what `package.json` actually is

> **Rails analogy:** `package.json` is your `Gemfile` + `Gemfile.lock` + `.ruby-version` + the app's runtime config, all in one file. `node_modules/` is your `vendor/bundle`. npm is your Bundler.

> **New to terminals / npm / Node?** Read the "Before you start" section of `tasks/README.md` first. It covers what a terminal is, what Node and npm do, and the common errors you'll hit. You don't need to be a terminal expert — just comfortable copying commands.

## What you'll learn
- What `package.json` is and every field in it
- ESM (`import`/`export`) vs CommonJS (`require`) — the one concept that bites Rails devs hardest
- `npm init`, `npm install`, `npm run <script>`
- Why this is a **library/package** (a "gem"), not an app

## What to do

**Step 1 — Create the repo structure.** On GitHub you already made `Nicktriez/lang-leak-checker`. Clone it and cd in:

```bash
git clone git@github.com:Nicktriez/lang-leak-checker.git
cd lang-leak-checker
```

(`git clone` copies the repo from GitHub to your machine into a folder called `lang-leak-checker`. `cd` moves you into it. Remember `pwd` shows where you are — run it if you ever feel lost.)

**Step 2 — Run `npm init` interactively.** You've been doing this. Answer:
- package name: `lang-leak-checker`
- version: `0.1.0`
- **entry point: `dist/cli.js`** (we set this by hand — see Step 4)
- **test command: blank**
- **git repository: blank** (cosmetic)
- **keywords: blank** (cosmetic)
- author: `Nicklas N. Jensen`
- license: `MIT`
- **type: `module`** ← this one matters

## The `type: module` decision — read this carefully

Open the generated `package.json`. You'll see `"type": "module"`. This tells Node: **"the `.js` files in this package use `import`/`export`, not `require`."**

Rails devs write `require 'x'` in Ruby. In JS there are TWO module systems:
- **CommonJS:** `const x = require('x')`, `module.exports = x` — the old/default way.
- **ESM:** `import x from 'x'`, `export function y()` — the modern way, which TypeScript targets.

We want `module` because our TypeScript compiles to `import`/`export`, and Node needs to know that's what the compiled `.js` will contain. `"type": "module"` is the flag that makes `dist/cli.js` (compiled ESM) actually run.

> **If you ever see `Cannot use import statement outside a module`** — this is the cause. The file is `import`-ing but Node thinks it's CommonJS. Fix: `type: module` in package.json, or rename the file to `.mjs`.

**Step 3 — Create `.gitignore`.** Never commit `node_modules/` or build output:

```bash
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
```

**Step 4 — Set the package fields the plan needs.** Run these (they overwrite whatever `npm init` wrote):

```bash
npm pkg set main=dist/cli.js
npm pkg set bin.lang-leak-checker=dist/cli.js
npm pkg set scripts.dev="tsx src/cli.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.test="node --test --import tsx test/"
```

Look at what these did. `main` is what Node uses when the package is imported as a library. `bin` is what exposes the `lang-leak-checker` command when another project installs this as a dependency — like a Ruby gem's executable. The `scripts` are npm's version of rake tasks / `bin/rails`.

**Step 5 — Install the runtime deps.**

```bash
npm install cheerio commander
npm install -D typescript tsx @types/node
```

- `cheerio` — like Nokogiri for Ruby, but jQuery-style: parse HTML, select elements.
- `commander` — like Ruby's `Thor`/`OptionParser` for CLI argument parsing.
- `-D` means **devDependencies** (the Rails `group :development` — only needed to build/test, never shipped).

Look at `package.json` again. You now have `dependencies` and `devDependencies`. That split is the exact JS version of Rails' `Gemfile` groups.

**Step 6 — First commit.**

```bash
git add -A && git commit -m "chore: scaffold lang-leak-checker"
git push
```

## Check you understand
- [ ] I can explain the difference between `dependencies` and `devDependencies` using a Rails `Gemfile` analogy.
- [ ] I can explain why `type: module` matters, and what error you'd see without it.
- [ ] I can point at which field in `package.json` makes the `lang-leak-checker` command exist for consumers.
- [ ] I committed and pushed the scaffold.
