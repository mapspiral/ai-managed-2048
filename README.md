# ai-managed-2048

A minimal 2048 game built with [Tauri v2](https://tauri.app) and TypeScript. Built as a live test bed for an AI-driven SDLC workflow.

## Getting started on macOS

### Prerequisites

- [Podman](https://podman.io) — used to run the Rust/Tauri build toolchain in a container (no native Rust installation required)
- [Node.js](https://nodejs.org) (v20+)
- [pnpm](https://pnpm.io) — `npm install -g pnpm`

### First-time setup

```bash
# Clone the repo
git clone https://github.com/mapspiral/ai-managed-2048.git
cd ai-managed-2048

# Install Node dependencies
pnpm install

# Initialise Podman machine (first time only — allocate enough RAM for Rust compilation)
podman machine init --memory 8192
podman machine start
```

### Run in development mode

```bash
pnpm tauri:dev
```

This builds the container image, compiles the Rust backend, and launches the app. The first run takes several minutes while Rust dependencies are compiled and cached.

### Build a release binary

```bash
pnpm tauri:build
```

Produces `.deb`, `.rpm`, and `.AppImage` bundles under `src-tauri/target/release/bundle/`.

### Native build (optional)

If you have Rust installed natively via [rustup](https://rustup.rs), you can skip the container:

```bash
pnpm tauri dev     # dev mode
pnpm tauri build   # release build
```

## Tech stack

| Layer | Choice |
|-------|--------|
| App framework | Tauri v2 |
| Frontend | TypeScript + plain CSS |
| Build tooling | Vite |
| Package manager | pnpm |
| Build environment | Podman container (macOS) |

## Development

See [`docs/PRD.md`](docs/PRD.md) for the full product requirements and SDLC workflow.
