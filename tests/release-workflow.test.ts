import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { load as parseYaml } from 'js-yaml'
import { describe, expect, it, beforeAll } from 'vitest'

const ROOT = join(import.meta.dirname, '..')
const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'release.yml')

let wf: any

beforeAll(() => {
  if (existsSync(WORKFLOW_PATH)) {
    wf = parseYaml(readFileSync(WORKFLOW_PATH, 'utf8'))
  }
})

function allSteps(workflow: any): any[] {
  if (!workflow?.jobs) return []
  return Object.values(workflow.jobs).flatMap((job: any) => job?.steps ?? [])
}

function jobNames(workflow: any): string[] {
  return Object.keys(workflow?.jobs ?? {})
}

describe('.github/workflows/release.yml — trigger', () => {
  it('exists', () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true)
  })

  it('triggers on push to semver tags', () => {
    const tags: string[] = wf?.on?.push?.tags ?? []
    const hasStable = tags.some((t) => /v\[0-9\]/.test(t))
    expect(hasStable).toBe(true)
  })

  it('also triggers on pre-release tags', () => {
    const tags: string[] = wf?.on?.push?.tags ?? []
    // At least one pattern must capture pre-release suffixes (contains wildcard after semver core)
    const hasPrerelease = tags.some((t) => t.includes('-'))
    expect(hasPrerelease).toBe(true)
  })
})

describe('.github/workflows/release.yml — version validation', () => {
  it('has a step that validates the tag against package.json version', () => {
    const steps = allSteps(wf)
    const validationStep = steps.find(
      (s) => typeof s?.run === 'string' && /package\.json/.test(s.run) && /GITHUB_REF|tag/i.test(s.run),
    )
    expect(validationStep).toBeDefined()
  })

  it('has a step that validates the tag against Cargo.toml version', () => {
    const steps = allSteps(wf)
    const validationStep = steps.find(
      (s) => typeof s?.run === 'string' && /Cargo\.toml/.test(s.run) && /GITHUB_REF|tag/i.test(s.run),
    )
    expect(validationStep).toBeDefined()
  })
})

describe('.github/workflows/release.yml — build jobs', () => {
  it('has a macOS build job on macos-latest', () => {
    const jobs = wf?.jobs ?? {}
    const macosJob = Object.values(jobs).find(
      (j: any) => j?.['runs-on'] === 'macos-latest',
    )
    expect(macosJob).toBeDefined()
  })

  it('does not have a macOS x86_64 build job', () => {
    const jobs = wf?.jobs ?? {}
    const macosX64 = Object.values(jobs).find(
      (j: any) => typeof j?.['runs-on'] === 'string' && /macos/i.test(j['runs-on'])
        && JSON.stringify(j).includes('x86_64'),
    )
    expect(macosX64).toBeUndefined()
  })

  it('has a Linux build job on ubuntu that builds a .deb', () => {
    const jobs = wf?.jobs ?? {}
    const linuxJob = Object.values(jobs).find(
      (j: any) => typeof j?.['runs-on'] === 'string' && /ubuntu/i.test(j['runs-on'])
        && JSON.stringify(j).includes('.deb'),
    )
    expect(linuxJob).toBeDefined()
  })

  it('Linux job does not build an AppImage', () => {
    const jobs = wf?.jobs ?? {}
    const linuxJob = Object.values(jobs).find(
      (j: any) => typeof j?.['runs-on'] === 'string' && /ubuntu/i.test(j['runs-on']),
    ) as any
    expect(JSON.stringify(linuxJob)).not.toMatch(/AppImage/)
  })
})

describe('.github/workflows/release.yml — macOS codesigning', () => {
  it('macOS build step uses --bundles app, not --bundles dmg', () => {
    const jobs = wf?.jobs ?? {}
    const macosJob = Object.values(jobs).find(
      (j: any) => j?.['runs-on'] === 'macos-latest',
    ) as any
    const buildStep = (macosJob?.steps ?? []).find(
      (s: any) => typeof s?.run === 'string' && /tauri build/.test(s.run),
    )
    expect(buildStep).toBeDefined()
    expect(buildStep.run).toMatch(/--bundles app/)
    expect(buildStep.run).not.toMatch(/--bundles dmg/)
  })

  it('macOS job has a codesign re-sign step with --force --deep --sign -', () => {
    const jobs = wf?.jobs ?? {}
    const macosJob = Object.values(jobs).find(
      (j: any) => j?.['runs-on'] === 'macos-latest',
    ) as any
    const codesignStep = (macosJob?.steps ?? []).find(
      (s: any) => typeof s?.run === 'string' && /codesign/.test(s.run) && /--force/.test(s.run) && /--deep/.test(s.run) && /--sign\s+-/.test(s.run),
    )
    expect(codesignStep).toBeDefined()
  })

  it('macOS job has an hdiutil create step to package the DMG', () => {
    const jobs = wf?.jobs ?? {}
    const macosJob = Object.values(jobs).find(
      (j: any) => j?.['runs-on'] === 'macos-latest',
    ) as any
    const hdiutilStep = (macosJob?.steps ?? []).find(
      (s: any) => typeof s?.run === 'string' && /hdiutil create/.test(s.run),
    )
    expect(hdiutilStep).toBeDefined()
  })
})

describe('.github/workflows/release.yml — GitHub Release', () => {
  it('has a release job', () => {
    expect(jobNames(wf).length).toBeGreaterThan(1)
    const releaseJob = Object.values(wf?.jobs ?? {}).find(
      (j: any) => JSON.stringify(j).includes('softprops/action-gh-release') || JSON.stringify(j).includes('gh release'),
    )
    expect(releaseJob).toBeDefined()
  })

  it('release job depends on all build jobs', () => {
    const jobs = wf?.jobs ?? {}
    const releaseJob = Object.values(jobs).find(
      (j: any) => JSON.stringify(j).includes('softprops/action-gh-release') || JSON.stringify(j).includes('gh release'),
    ) as any
    expect(releaseJob?.needs).toBeDefined()
    expect(Array.isArray(releaseJob?.needs) ? releaseJob.needs.length : 1).toBeGreaterThanOrEqual(2)
  })

  it('attaches artifacts to the release', () => {
    const jobs = wf?.jobs ?? {}
    const releaseJob = Object.values(jobs).find(
      (j: any) => JSON.stringify(j).includes('softprops/action-gh-release') || JSON.stringify(j).includes('gh release'),
    ) as any
    const releaseStep = (releaseJob?.steps ?? []).find(
      (s: any) => JSON.stringify(s).includes('softprops/action-gh-release') || JSON.stringify(s).includes('gh release'),
    )
    // files/assets param or artifact download before gh release
    const yaml = JSON.stringify(releaseStep ?? releaseJob)
    expect(yaml).toMatch(/files|artifacts|asset/i)
  })

  it('creates a draft release for pre-release tags', () => {
    const yaml = JSON.stringify(wf)
    expect(yaml).toMatch(/draft|prerelease/i)
    expect(yaml).toMatch(/pre.?release|beta|alpha|-[a-z]/i)
  })
})
