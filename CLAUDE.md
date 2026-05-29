# Agent Rules

Guidelines for AI agents working on this repository.

## Versioning

Before opening a PR, run `scripts/bump-version.sh <patch|minor|major>` based on the change
type defined in `docs/versioning.md`. Commit the version bump as a separate commit in the
same PR:

```
chore(release): bump version to x.y.z
```

## Commits

All commits must use Conventional Commits format:

```
<type>(<scope>): <description>
```

Valid types: `feat`, `fix`, `chore`, `ci`, `docs`, `refactor`, `test`.

## Tests

All tests must pass before making a commit. Never commit with failing tests.

```bash
pnpm test   # TypeScript / Vite tests
cargo test  # Rust tests (run from src-tauri/)
```

## Documentation

All documentation files (`.md`, `.rst`, `.adoc`) must live under `docs/`. Never create
documentation at the repo root or inside source directories, with the exception of
`README.md` and `CLAUDE.md`.

## Game Logic

Game logic lives in TypeScript (`src/`), not Rust. The Rust backend (`src-tauri/`) is
limited to Tauri shell integration.
