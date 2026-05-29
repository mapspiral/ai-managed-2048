# Versioning Convention

This project uses [Semantic Versioning](https://semver.org) (`MAJOR.MINOR.PATCH`).

## Bump types

| Type | When to use | Examples |
|------|-------------|---------|
| `patch` | Bug fixes, CI changes, dependency updates, documentation | Fix a game logic bug, update a dependency, tweak CI config |
| `minor` | New user-facing features (new game functionality, UI additions) | Add score display, implement tile animations |
| `major` | Breaking changes to architecture or platform support | Drop macOS support, restructure the entire frontend |

## How to bump

```bash
scripts/bump-version.sh <patch|minor|major>
```

The script atomically updates `package.json` and `src-tauri/Cargo.toml` and prints the old and new version.

## Rules

- Every PR that changes user-facing behaviour or fixes a bug must include a version bump.
- The bump commit must be separate from feature commits and use the message:
  `chore(release): bump version to x.y.z`
- The git tag on the release commit must match the version in both manifest files.
