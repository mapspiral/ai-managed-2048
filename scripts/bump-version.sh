#!/usr/bin/env bash
# EMERGENCY USE ONLY — not part of the normal release workflow.
# Versions are managed automatically by release-please (see docs/versioning.md).
# Only use this script to correct a version after a failed release or to bootstrap
# a new environment where the release-please manifest is out of sync.
#
# Atomically bumps the version in package.json, src-tauri/Cargo.toml, and
# src-tauri/tauri.conf.json. Must be run from the repository root.
set -euo pipefail

BUMP="${1:-}"

if [[ -z "$BUMP" ]]; then
  echo "Usage: scripts/bump-version.sh <major|minor|patch>" >&2
  echo "Missing argument: bump type is required" >&2
  exit 1
fi

if [[ "$BUMP" != "major" && "$BUMP" != "minor" && "$BUMP" != "patch" ]]; then
  echo "Invalid argument: '$BUMP'. Must be one of: major, minor, patch" >&2
  exit 1
fi

PKG_JSON="package.json"
CARGO_TOML="src-tauri/Cargo.toml"
TAURI_CONF="src-tauri/tauri.conf.json"

CURRENT="$(node -e "process.stdout.write(require('./${PKG_JSON}').version)")"

IFS='.' read -r MAJ MIN PAT <<< "$CURRENT"

case "$BUMP" in
  major) NEW="$((MAJ + 1)).0.0" ;;
  minor) NEW="${MAJ}.$((MIN + 1)).0" ;;
  patch) NEW="${MAJ}.${MIN}.$((PAT + 1))" ;;
esac

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('${PKG_JSON}', 'utf8'));
pkg.version = '${NEW}';
fs.writeFileSync('${PKG_JSON}', JSON.stringify(pkg, null, 2) + '\n');
"

sed -i.bak "s/^version = \"${CURRENT}\"/version = \"${NEW}\"/" "$CARGO_TOML"
rm -f "${CARGO_TOML}.bak"

node -e "
const fs = require('fs');
const conf = JSON.parse(fs.readFileSync('${TAURI_CONF}', 'utf8'));
conf.version = '${NEW}';
fs.writeFileSync('${TAURI_CONF}', JSON.stringify(conf, null, 2) + '\n');
"

echo "Bumped version: ${CURRENT} → ${NEW}"
