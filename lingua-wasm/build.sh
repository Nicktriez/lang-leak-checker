#!/usr/bin/env bash
# Rebuild the lingua wasm detector with a chosen set of languages.
#
# Lingua compiles one language model per feature, so languages are a BUILD-TIME
# choice (each adds ~5 MB to the artifact and must be committed). Run this when
# you need the tool to support a new language:
#
#   ./build.sh                      # default: danish english polish
#   ./build.sh polish german french # your own set
#
# It rewrites Cargo.toml's lingua feature list, builds with wasm-pack, and
# copies the artifact into ../wasm/ (with the .cjs/.d.cts names our ESM
# package expects). Commit ../wasm/ afterwards.
set -euo pipefail
cd "$(dirname "$0")"

LANGS=("$@")
if [ ${#LANGS[@]} -eq 0 ]; then
  LANGS=(danish english polish)
fi

FEATURES=$(printf '"%s"' "${LANGS[0]}")
for L in "${LANGS[@]:1}"; do
  FEATURES="$FEATURES, \"$L\""
done

sed -i "s/features = \[.*\]/features = [$FEATURES]/" Cargo.toml
echo "Building with lingua features: $FEATURES"

wasm-pack build --target nodejs

# Emit the compiled-language manifest so the CLI can reject languages that
# are mapped but not present in this artifact with a clear rebuild hint.
node -e "console.log(JSON.stringify(process.argv.slice(1).map(s => s[0].toUpperCase() + s.slice(1))))" "${LANGS[@]}" > ../wasm/LANGUAGES.json

mkdir -p ../wasm
cp pkg/lingua_wasm_bg.wasm ../wasm/
cp pkg/lingua_wasm.js ../wasm/lingua_wasm.cjs
cp pkg/lingua_wasm.d.ts ../wasm/lingua_wasm.d.cts
echo "Copied to ../wasm/:"
ls -la ../wasm/