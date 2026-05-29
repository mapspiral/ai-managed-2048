import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { load as parseYaml } from 'js-yaml'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '..')

function readJson(rel: string) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'))
}

describe('.release-please-manifest.json', () => {
  it('exists', () => {
    expect(existsSync(join(ROOT, '.release-please-manifest.json'))).toBe(true)
  })

  it('declares a version for the root package', () => {
    const manifest = readJson('.release-please-manifest.json')
    expect(manifest['.']).toBeDefined()
    expect(manifest['.']).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('version matches package.json', () => {
    const manifest = readJson('.release-please-manifest.json')
    const pkg = readJson('package.json')
    expect(manifest['.']).toBe(pkg.version)
  })
})

describe('release-please-config.json', () => {
  it('exists', () => {
    expect(existsSync(join(ROOT, 'release-please-config.json'))).toBe(true)
  })

  it('configures a simple release type at the root package', () => {
    const config = readJson('release-please-config.json')
    const root = config?.packages?.['.']
    expect(root?.['release-type']).toBe('simple')
  })

  it('has extra-files entry for src-tauri/Cargo.toml', () => {
    const config = readJson('release-please-config.json')
    const extraFiles: any[] = config?.packages?.['.']?.['extra-files'] ?? []
    const cargoEntry = extraFiles.find(
      (f: any) => typeof f === 'object' && f.path === 'src-tauri/Cargo.toml',
    )
    expect(cargoEntry).toBeDefined()
  })

  it('has extra-files entry for src-tauri/tauri.conf.json', () => {
    const config = readJson('release-please-config.json')
    const extraFiles: any[] = config?.packages?.['.']?.['extra-files'] ?? []
    const tauriEntry = extraFiles.find(
      (f: any) => typeof f === 'object' && f.path === 'src-tauri/tauri.conf.json',
    )
    expect(tauriEntry).toBeDefined()
  })
})

describe('.github/workflows/release-please.yml', () => {
  const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'release-please.yml')

  it('exists', () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true)
  })

  it('triggers on push to main', () => {
    const wf = parseYaml(readFileSync(WORKFLOW_PATH, 'utf8')) as any
    const branches: string[] = wf?.on?.push?.branches ?? []
    expect(branches).toContain('main')
  })

  it('uses google-github-actions/release-please-action@v4', () => {
    const wf = parseYaml(readFileSync(WORKFLOW_PATH, 'utf8')) as any
    const steps = Object.values(wf?.jobs ?? {}).flatMap((j: any) => j?.steps ?? [])
    const action = steps.find(
      (s: any) => typeof s?.uses === 'string' && s.uses.startsWith('google-github-actions/release-please-action@v4'),
    )
    expect(action).toBeDefined()
  })

  it('passes config-file and manifest-file to the action', () => {
    const wf = parseYaml(readFileSync(WORKFLOW_PATH, 'utf8')) as any
    const steps = Object.values(wf?.jobs ?? {}).flatMap((j: any) => j?.steps ?? [])
    const action = steps.find(
      (s: any) => typeof s?.uses === 'string' && s.uses.startsWith('google-github-actions/release-please-action@v4'),
    ) as any
    expect(action?.with?.['config-file']).toBe('release-please-config.json')
    expect(action?.with?.['manifest-file']).toBe('.release-please-manifest.json')
  })

  it('has write permissions for contents and pull-requests', () => {
    const wf = parseYaml(readFileSync(WORKFLOW_PATH, 'utf8')) as any
    const topPermissions = wf?.permissions ?? {}
    const jobPermissions = Object.values(wf?.jobs ?? {}).reduce(
      (acc: any, j: any) => ({ ...acc, ...(j?.permissions ?? {}) }),
      {} as any,
    )
    const all = { ...topPermissions, ...jobPermissions }
    expect(all['contents']).toBe('write')
    expect(all['pull-requests']).toBe('write')
  })
})

describe('CLAUDE.md — versioning rules', () => {
  it('does not instruct PRs to run bump-version.sh as a required step', () => {
    const content = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8')
    // The versioning section should not require running the bump script
    expect(content).not.toMatch(/Before opening a PR.*bump-version/s)
  })

  it('references release-please for version management', () => {
    const content = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8')
    expect(content.toLowerCase()).toMatch(/release-please|release please/)
  })
})

describe('docs/versioning.md', () => {
  it('mentions release-please', () => {
    const content = readFileSync(join(ROOT, 'docs', 'versioning.md'), 'utf8')
    expect(content.toLowerCase()).toMatch(/release-please|release please/)
  })

  it('retires the manual bump instruction', () => {
    const content = readFileSync(join(ROOT, 'docs', 'versioning.md'), 'utf8')
    // Should not say PRs must include a version bump commit
    expect(content).not.toMatch(/Every PR.*must include a version bump/i)
  })
})

describe('scripts/bump-version.sh — emergency override', () => {
  it('still exists', () => {
    expect(existsSync(join(ROOT, 'scripts', 'bump-version.sh'))).toBe(true)
  })

  it('contains documentation that it is for emergency use only', () => {
    const content = readFileSync(join(ROOT, 'scripts', 'bump-version.sh'), 'utf8')
    expect(content.toLowerCase()).toMatch(/emergency/)
  })
})
