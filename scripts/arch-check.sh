#!/usr/bin/env bash
# Architecture fitness checks. Run from the repository root.
# Fails with a non-zero exit code if any structural invariant is violated.
set -euo pipefail

status=0

fail() {
  echo "FAIL: $*" >&2
  status=1
}

# --- Check 1: no .md files outside docs/ (except known root exceptions) ---
readonly -a ALLOWED_ROOT_MD=(README.md CLAUDE.md CHANGELOG.md)

while IFS= read -r -d '' mdfile; do
  rel="${mdfile#./}"

  [[ "$rel" == docs/* ]] && continue
  [[ "$rel" == .claude/* ]] && continue

  allowed=false
  for name in "${ALLOWED_ROOT_MD[@]}"; do
    [[ "$rel" == "$name" ]] && allowed=true && break
  done
  $allowed && continue

  fail "Markdown file outside docs/: $rel"
done < <(find . -name "*.md" \
    -not -path "./.git/*" \
    -not -path "./node_modules/*" \
    -not -path "./src-tauri/target/*" \
    -print0)

# --- Check 2: src-tauri/src/ must contain no game-logic function names ---
readonly -a GAME_FUNCTIONS=(slide merge spawn)

if [[ -d "src-tauri/src" ]]; then
  for fn in "${GAME_FUNCTIONS[@]}"; do
    if grep -rn --include="*.rs" "\bfn ${fn}\b" src-tauri/src/ >/dev/null 2>&1; then
      fail "Game logic in Rust: function '${fn}' found in src-tauri/src/ (game logic must live in TypeScript)"
    fi
  done
fi

# --- Check 3: version in package.json and src-tauri/Cargo.toml must match ---
if [[ -f "package.json" && -f "src-tauri/Cargo.toml" ]]; then
  if ! command -v jq &>/dev/null; then
    fail "jq is required for the version check but was not found"
  else
    pkg_version=$(jq --raw-output '.version' package.json)
    cargo_version=$(grep '^version = ' src-tauri/Cargo.toml | head -1 | sed 's/version = "\(.*\)"/\1/')

    if [[ -z "$pkg_version" || "$pkg_version" == "null" || -z "$cargo_version" ]]; then
      fail "Could not read version from package.json or src-tauri/Cargo.toml"
    elif [[ "$pkg_version" != "$cargo_version" ]]; then
      fail "Version mismatch: package.json=${pkg_version}, src-tauri/Cargo.toml=${cargo_version}"
    fi
  fi
fi

if [[ "$status" -eq 0 ]]; then
  echo "All architecture checks passed."
fi

exit "$status"
