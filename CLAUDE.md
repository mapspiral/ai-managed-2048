# Agent Rules

Guidelines for AI agents working on this repository.

## Versioning

Version bumps are managed automatically by [release-please](https://github.com/googleapis/release-please).
Do **not** run `scripts/bump-version.sh` or include `chore(release):` commits in PRs.
After each push to `main`, the release-please Action creates or updates a Release PR with
the correct next version computed from conventional commits on `main`.

See `docs/versioning.md` for the full workflow.

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
