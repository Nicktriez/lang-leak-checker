# Task 9 — Packaging: making this a real JS dependency (the "gem")

> **Rails analogy:** This is the entire `gem build` / gemspec story — taking your working code and making it *installable* as a dependency another project can `gem install` and require. You've been building toward this since Task 0.

## What you'll learn
- What `main`, `bin`, and `files` do in `package.json` (the gemspec equivalents)
- The shebang and why compiled output is the bin target
- `npm pack` — building the installable tarball
- Installing your own package locally with `npm link`

## Step 1 — Confirm the package.json fields are right

```bash
npm run build     # produces dist/
npm pkg get main bin
```

You should see:
```json
"main": "dist/cli.js",
"bin": { "lang-leak-checker": "dist/cli.js" }
```

And `dist/` should exist from the build. **The `bin` target must be the compiled `dist/cli.js`**, not `src/cli.ts` — because when another project installs this, Node runs the bin file directly and Node can't execute TypeScript. The consumer never has `tsx`.

## Step 2 — Make `files` explicit

`files` tells npm what to actually include when packaged (like a gem's `files` in the gemspec). Add it so we ship only what's needed:

```bash
npm pkg set files='["dist","wasm"]'
```

Check `package.json` — you now have:
```json
"files": ["dist", "wasm"]
```
This means: the compiled JS + the wasm detector. No `src`, no `test`, no junk. The consumer gets exactly what it needs to run.

## Step 3 — Verify the tarball contents

```bash
npm pack --dry-run
```

`--dry-run` shows what would be in the published package *without* creating it. You should see `dist/cli.js` and `wasm/` listed. If `dist/` is missing, the build didn't run or `files` is wrong — the bin target must ship or the install is broken.

## Step 4 — The shebang (why it's there)

The first line of `src/cli.ts` is `#!/usr/bin/env node`. When npm installs the package, it creates a `node_modules/.bin/lang-leak-checker` symlink to `dist/cli.js`. That shebang tells the OS "run this with node." Without it, the shell wouldn't know how to execute the file. This is the equivalent of a Ruby script's `#!/usr/bin/env ruby`.

## Step 5 — `npm link` (test it as a real dependency, locally)

`npm link` lets you install your in-development package into another project as if it were published — the local version of "what will the consumer experience." From the lang-leak-checker repo:

```bash
npm link
```

Then in any other project:
```bash
npm link lang-leak-checker
lang-leak-checker --language da /tmp/mixed.html
```

The `lang-leak-checker` command now works globally/elsewhere. This proves the `bin` setup is correct **before** you ever install it by git URL. If `lang-leak-checker` isn't a valid command here, the whole distribution model is broken — this is the check that catches it.

## Check you understand
- [ ] I can explain `main`, `bin`, and `files` using the gem analogy.
- [ ] I can explain why the `bin` target is compiled JS, not TS.
- [ ] I ran `npm pack --dry-run` and saw `dist/cli.js` + `wasm/`.
- [ ] I ran `npm link` + `lang-leak-checker --language da /tmp/mixed.html` and it worked.
