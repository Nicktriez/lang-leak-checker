# Task 10 — Distribution: the Rails "dev-only gem" model, done for real

> **Rails analogy:** This is the payoff — installing your gem as a `group :development` dependency in a Rails app. Here: installing lang-leak-checker as a `devDependency` (git URL) in the price-watcher app, exactly the pattern from the plan.

## What you'll learn
- Git-URL dependencies (`"pkg": "git+https://..."`) — the JS version of `gem 'x', git: '...'`
- Why it goes in `devDependencies`, not `dependencies`
- `npm run <script>` aliases for ergonomics
- The `AGENTS.md` hook that makes AI agents actually use it

## Step 1 — Commit + push the package

Make sure everything's committed and pushed to `Nicktriez/lang-leak-checker`:

```bash
git add -A && git commit -m "feat: lang-leak-checker v0.1.0" && git push
```

The git URL install only works if the repo is pushed (and reachable).

## Step 2 — Install it as a devDependency in the price-watcher app

From the price-watcher repo (`/root/price-watcher`):

```bash
npm install --save-dev lang-leak-checker@git+https://github.com/Nicktriez/lang-leak-checker.git#main
```

**Note `--save-dev`** — that's what puts it in `devDependencies`, the JS `group :development`. Verify it landed in the right place:

```bash
grep '"lang-leak-checker"' package.json
```

It must appear under `"devDependencies"`, **not** `"dependencies"`. That placement is the entire "dev-only, never production" guarantee — production installs run `npm install --omit=dev` and skip it entirely.

## Step 3 — Add an npm script alias

So you don't type the full command every time, add to price-watcher's `package.json` scripts:

```json
"scripts": {
  "leak-check": "lang-leak-checker --language da $URL"
}
```

Now run it:
```bash
npm run leak-check -- https://beta.skujeg.dk/
```

`npm run <script> -- <args>` passes `https://beta.skujeg.dk/` into the script's `$URL`. The full-scan agent command adds `--json` and all routes.

## Step 4 — The AGENTS.md hook (the part that makes it actually used)

Add this to `price-watcher/AGENTS.md` under the "Ground rules for coding agents" section, next to `vp check`/`vp test`. **This is the fix-in-one-go contract** — it tells the AI agent that "fix English leakage" has a precise, testable meaning:

```markdown
- **"Fix English leakage" means: run the leak checker against the whole site, fix everything it flags, and prove exit 0.**
  1. `npm run leak-check -- --language da --json <site-url> <all-routes...>` — scan the full site, not one page.
  2. Read the JSON: each `{elementPath, text, detected}` is one leak to fix.
  3. Fix every flagged element. If a string isn't in the rendered component, grep `src/` for the leaked text to find its real source (e.g. a server module) and fix it there.
  4. Re-run the full-scan command. It must exit 0. Only then mark the task complete.
- **Do NOT mark any Danish-consistency or UI-copy task done without a passing leak-check** (exit 0 on the full-scan). The checker is the source of truth, not your grep.
```

## Read this — why this is the whole point

Everything in the previous nine tasks — the TS, the types, the detector, the packaging — exists to make **this** work: an AI agent that you tell "fix English leakage" can now run one command, see every leak in structured JSON, fix them all, and prove it's done via exit 0. It converts "Danish consistency" from the agent's *self-assessment* (which missed `Community` in a server file) into a hard, objective, whole-site gate.

The devDependency placement means this tool exists for every dev machine and agent that works on the app — but is structurally impossible to ship to production.

## Check you understand
- [ ] I can explain `git+https://...` dependencies and why they work like `gem 'x', git: ...`.
- [ ] I can explain why `--save-dev` matters and what "never in production" means structurally.
- [ ] I ran `npm run leak-check -- https://beta.skujeg.dk/` and it worked.
- [ ] I understand the AGENTS.md block is what makes the agent fix leaks in one go.
- [ ] I committed and pushed both repos.
