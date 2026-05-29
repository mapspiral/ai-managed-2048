# Distribution

## macOS — Homebrew

2048 is distributed as a macOS cask via a [Homebrew tap](https://github.com/mapspiral/homebrew-tap).

### Install

```sh
brew tap mapspiral/homebrew-tap
brew install --cask 2048
```

### Upgrade

```sh
brew upgrade --cask 2048
```

### Update cadence

The cask is updated automatically every time a new GitHub Release is published.
After release-please merges a Release PR and the `release.yml` workflow completes,
the `homebrew` CI job downloads the new DMG, computes its SHA-256, and pushes an
updated `Casks/2048.rb` to [mapspiral/homebrew-tap](https://github.com/mapspiral/homebrew-tap).
Running `brew upgrade --cask 2048` will pick up the new version within minutes.

### Tap repository

The cask formula lives at
[mapspiral/homebrew-tap](https://github.com/mapspiral/homebrew-tap) under
`Casks/2048.rb`. Updates are committed by the `github-actions[bot]` user.

## Linux — Debian/Ubuntu

A `.deb` package is attached to each GitHub Release and can be installed with:

```sh
sudo dpkg -i 2048_<version>_amd64.deb
```
