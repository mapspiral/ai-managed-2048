#!/usr/bin/env bash
# container-tauri.sh — Run pnpm tauri commands inside a Podman container.
# Usage: scripts/container-tauri.sh <dev|build> [extra tauri args...]
#
# This is the canonical way to invoke Tauri on macOS (where Rust is not
# installed natively).  On Linux CI runners the toolchain is installed
# directly, so this script is not used there.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMAND="${1:-build}"
shift || true

IMAGE_TAG="ai-managed-2048:local"

echo "==> Building container image..."
podman build -t "${IMAGE_TAG}" "${REPO_ROOT}"

case "${COMMAND}" in
  dev)
    echo "==> Running pnpm tauri dev (headless compilation check)..."
    podman run --rm \
      -v "${REPO_ROOT}:/app:z" \
      "${IMAGE_TAG}" \
      pnpm tauri dev --no-watch "$@"
    ;;
  build)
    echo "==> Running pnpm tauri build..."
    podman run --rm \
      -v "${REPO_ROOT}:/app:z" \
      -v "${REPO_ROOT}/src-tauri/target:/app/src-tauri/target:z" \
      "${IMAGE_TAG}" \
      pnpm tauri build "$@"
    ;;
  *)
    echo "Usage: $0 <dev|build> [extra tauri args...]" >&2
    exit 1
    ;;
esac
