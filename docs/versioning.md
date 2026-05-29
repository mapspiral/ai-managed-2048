# Versioning Convention

This project uses [Semantic Versioning](https://semver.org) (`MAJOR.MINOR.PATCH`) and
[release-please](https://github.com/googleapis/release-please) to automate version bumps
and release management.

## How releases work

1. Individual PRs carry **no version bumps** — just their conventional commits.
2. After each push to `main`, the `release-please` Action (`.github/workflows/release-please.yml`)
   reads the accumulated conventional commits and creates or updates a single **Release PR**
   with the correct next version.
3. When you are ready to ship, merge the Release PR. `release-please` creates the git tag,
   which triggers the existing `release.yml` build-and-publish workflow unchanged.

The version is tracked in `.release-please-manifest.json` and kept in sync across:
- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

## Bump types

| Commit type | Version bump | Examples |
|-------------|--------------|---------|
| `feat` | `minor` | New user-facing features, new game functionality |
| `fix`, `chore`, `ci`, `docs`, `refactor`, `test` | `patch` | Bug fixes, CI changes, dependency updates, documentation |
| `feat!` or `BREAKING CHANGE` footer | `major` | Breaking changes to architecture or platform support |

## Rules

- Do **not** run `scripts/bump-version.sh` or include `chore(release):` commits in PRs.
- All PRs must use [Conventional Commits](https://www.conventionalcommits.org) — release-please
  derives the next version and changelog from commit messages.

## Emergency manual override

`scripts/bump-version.sh` remains available as an **emergency-only** tool (e.g., to correct a
version after a failed release or to bootstrap a new environment). It must not be used as part
of the normal PR workflow.
