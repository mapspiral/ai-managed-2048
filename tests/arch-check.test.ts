import { execFileSync } from 'child_process'
import { mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const SCRIPT = join(import.meta.dirname, '..', 'scripts', 'arch-check.sh')

function makeFixture(opts: {
  version?: string
  cargoVersion?: string
  extraMdFiles?: string[]
  rustSrcFiles?: Record<string, string>
} = {}): string {
  const {
    version = '1.0.0',
    cargoVersion = '1.0.0',
    extraMdFiles = [],
    rustSrcFiles = {},
  } = opts

  const dir = mkdtempSync(join(tmpdir(), 'arch-check-'))
  mkdirSync(join(dir, 'docs'))
  mkdirSync(join(dir, 'src-tauri', 'src'), { recursive: true })

  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'test', version }, null, 2) + '\n')
  writeFileSync(
    join(dir, 'src-tauri', 'Cargo.toml'),
    `[package]\nname = "test"\nversion = "${cargoVersion}"\n`,
  )
  writeFileSync(join(dir, 'README.md'), '# Test\n')
  writeFileSync(join(dir, 'docs', 'guide.md'), '# Guide\n')

  for (const mdPath of extraMdFiles) {
    const abs = join(dir, mdPath)
    mkdirSync(join(abs, '..'), { recursive: true })
    writeFileSync(abs, '# Extra\n')
  }

  for (const [relPath, content] of Object.entries(rustSrcFiles)) {
    const abs = join(dir, 'src-tauri', 'src', relPath)
    mkdirSync(join(abs, '..'), { recursive: true })
    writeFileSync(abs, content)
  }

  return dir
}

function run(cwd: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execFileSync('bash', [SCRIPT], { cwd, encoding: 'utf8' })
    return { stdout, stderr: '', code: 0 }
  } catch (err: any) {
    return { stdout: err.stdout ?? '', stderr: err.stderr ?? '', code: err.status ?? 1 }
  }
}

describe('scripts/arch-check.sh', () => {
  it('exists at scripts/arch-check.sh', () => {
    expect(existsSync(SCRIPT)).toBe(true)
  })
})

describe('markdown file check', () => {
  it('exits 0 when all .md files are under docs/ or are README.md', () => {
    const dir = makeFixture()
    const { code } = run(dir)
    expect(code).toBe(0)
  })

  it('exits non-zero when a .md file exists at the repo root other than README.md', () => {
    const dir = makeFixture({ extraMdFiles: ['NOTES.md'] })
    const { code } = run(dir)
    expect(code).not.toBe(0)
  })

  it('exits non-zero when a .md file exists in a source directory', () => {
    const dir = makeFixture({ extraMdFiles: ['src/NOTES.md'] })
    const { code } = run(dir)
    expect(code).not.toBe(0)
  })

  it('allows CLAUDE.md at root', () => {
    const dir = makeFixture({ extraMdFiles: ['CLAUDE.md'] })
    const { code } = run(dir)
    expect(code).toBe(0)
  })

  it('allows CHANGELOG.md at root', () => {
    const dir = makeFixture({ extraMdFiles: ['CHANGELOG.md'] })
    const { code } = run(dir)
    expect(code).toBe(0)
  })
})

describe('game logic check', () => {
  it('exits 0 when src-tauri/src/ has no game-logic function names', () => {
    const dir = makeFixture({
      rustSrcFiles: { 'lib.rs': 'pub fn greet(name: &str) -> String {\n    format!("Hello, {}!", name)\n}\n' },
    })
    const { code } = run(dir)
    expect(code).toBe(0)
  })

  it('exits non-zero when src-tauri/src/ contains a function named slide', () => {
    const dir = makeFixture({
      rustSrcFiles: { 'game.rs': 'fn slide(board: &mut Board) {}\n' },
    })
    const { code } = run(dir)
    expect(code).not.toBe(0)
  })

  it('exits non-zero when src-tauri/src/ contains a function named merge', () => {
    const dir = makeFixture({
      rustSrcFiles: { 'game.rs': 'pub fn merge(a: u32, b: u32) -> u32 { a + b }\n' },
    })
    const { code } = run(dir)
    expect(code).not.toBe(0)
  })

  it('exits non-zero when src-tauri/src/ contains a function named spawn', () => {
    const dir = makeFixture({
      rustSrcFiles: { 'game.rs': 'fn spawn(board: &mut Vec<u32>) {}\n' },
    })
    const { code } = run(dir)
    expect(code).not.toBe(0)
  })
})

describe('version sync check', () => {
  it('exits 0 when package.json and Cargo.toml versions match', () => {
    const dir = makeFixture({ version: '1.2.3', cargoVersion: '1.2.3' })
    const { code } = run(dir)
    expect(code).toBe(0)
  })

  it('exits non-zero when package.json and Cargo.toml versions differ', () => {
    const dir = makeFixture({ version: '1.2.3', cargoVersion: '1.2.2' })
    const { code } = run(dir)
    expect(code).not.toBe(0)
  })

  it('prints the differing versions when they are out of sync', () => {
    const dir = makeFixture({ version: '2.0.0', cargoVersion: '1.9.9' })
    const { stdout, stderr } = run(dir)
    const output = stdout + stderr
    expect(output).toMatch(/2\.0\.0/)
    expect(output).toMatch(/1\.9\.9/)
  })
})
