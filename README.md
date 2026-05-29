# ai-managed-2048

A minimal 2048 game built with [Tauri v2](https://tauri.app) and TypeScript. Built as a live test bed for an AI-driven SDLC workflow.

## Getting started on macOS

### Prerequisites

- [Rust](https://rustup.rs) — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- [Node.js](https://nodejs.org) (v20+)
- [pnpm](https://pnpm.io) — `npm install -g pnpm`

Tauri also requires the Xcode Command Line Tools:

```bash
xcode-select --install
```

### First-time setup

```bash
# Clone the repo
git clone https://github.com/mapspiral/ai-managed-2048.git
cd ai-managed-2048

# Install Node dependencies
pnpm install
```

### Run in development mode

```bash
pnpm tauri dev
```

Compiles the Rust backend and launches the app with hot-reload for the frontend. The first run takes several minutes while Rust dependencies are compiled.

### Build a release binary

```bash
pnpm tauri build
```

Produces a macOS `.app` bundle and `.dmg` installer under `src-tauri/target/release/bundle/`.

## Tech stack

| Layer | Choice |
|-------|--------|
| App framework | Tauri v2 |
| Frontend | TypeScript + plain CSS |
| Build tooling | Vite |
| Package manager | pnpm |

## Development

See [`docs/PRD.md`](docs/PRD.md) for the full product requirements and SDLC workflow.
