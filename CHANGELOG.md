# Changelog

## [0.5.0](https://github.com/mapspiral/ai-managed-2048/compare/v0.4.0...v0.5.0) (2026-05-29)


### Features

* **input:** add pointer-based swipe handler for mouse and touch ([3f8e9c4](https://github.com/mapspiral/ai-managed-2048/commit/3f8e9c4dfa69aad725eda05ba66c2b29d22c0824)), closes [#12](https://github.com/mapspiral/ai-managed-2048/issues/12)

## [0.4.0](https://github.com/mapspiral/ai-managed-2048/compare/v0.3.0...v0.4.0) (2026-05-29)


### Features

* **board:** implement Board type and tile spawn logic ([1ccfb58](https://github.com/mapspiral/ai-managed-2048/commit/1ccfb58af3aab98504e49d07b05e6fcbe15e99fd))
* **board:** implement tile slide and merge logic with score tracking ([32d1977](https://github.com/mapspiral/ai-managed-2048/commit/32d1977441ef8484896f6e7ba2a84a4154c9db1b))
* **board:** implement win/lose detection and new game reset ([b9101ab](https://github.com/mapspiral/ai-managed-2048/commit/b9101ab0158ff47c11d9f75bd30f429e285b751b))
* **ui:** build game board and score UI ([ef3d72c](https://github.com/mapspiral/ai-managed-2048/commit/ef3d72ca1b8169b757f7cbddbad542ea4a2848ab))


### Bug Fixes

* **capabilities:** lock down Tauri capability model to minimal permissions ([a80f6a3](https://github.com/mapspiral/ai-managed-2048/commit/a80f6a3c6d1b24f935719dd403ba24b04b019284))
* **release:** bump-version.sh now updates tauri.conf.json ([a721031](https://github.com/mapspiral/ai-managed-2048/commit/a7210314b54960db1e8d4e1f6439a313380679f7))
* **release:** re-sign macOS app bundle to fix damaged DMG ([3128d82](https://github.com/mapspiral/ai-managed-2048/commit/3128d82a685b29472b91f3a4568bee1634cac31d))
* **release:** validate tauri.conf.json version in release workflow ([cd7021e](https://github.com/mapspiral/ai-managed-2048/commit/cd7021e22f1eae2e584b5f4fb633c5eedfd3148b))

## [0.2.0](https://github.com/mapspiral/ai-managed-2048/compare/v0.1.4...v0.2.0) (2026-05-29)


### Features

* **board:** implement Board type and tile spawn logic ([1ccfb58](https://github.com/mapspiral/ai-managed-2048/commit/1ccfb58af3aab98504e49d07b05e6fcbe15e99fd))


### Bug Fixes

* **capabilities:** lock down Tauri capability model to minimal permissions ([a80f6a3](https://github.com/mapspiral/ai-managed-2048/commit/a80f6a3c6d1b24f935719dd403ba24b04b019284))
* **release:** bump-version.sh now updates tauri.conf.json ([a721031](https://github.com/mapspiral/ai-managed-2048/commit/a7210314b54960db1e8d4e1f6439a313380679f7))
* **release:** re-sign macOS app bundle to fix damaged DMG ([3128d82](https://github.com/mapspiral/ai-managed-2048/commit/3128d82a685b29472b91f3a4568bee1634cac31d))
* **release:** validate tauri.conf.json version in release workflow ([cd7021e](https://github.com/mapspiral/ai-managed-2048/commit/cd7021e22f1eae2e584b5f4fb633c5eedfd3148b))
