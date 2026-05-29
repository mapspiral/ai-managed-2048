import { execSync, execFileSync } from 'child_process'
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const SCRIPT = join(import.meta.dirname, '..', 'scripts', 'bump-version.sh')

function makeFixture(version: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'bump-version-'))
  mkdirSync(join(dir, 'src-tauri'))
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'test', version }, null, 2) + '\n',
  )
  writeFileSync(
    join(dir, 'src-tauri', 'Cargo.toml'),
    `[package]\nname = "test"\nversion = "${version}"\n`,
  )
  writeFileSync(
    join(dir, 'src-tauri', 'tauri.conf.json'),
    JSON.stringify({ productName: 'test', version }, null, 2) + '\n',
  )
  return dir
}

function run(args: string, cwd: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execFileSync('bash', [SCRIPT, ...args.split(' ').filter(Boolean)], {
      cwd,
      encoding: 'utf8',
    })
    return { stdout, stderr: '', code: 0 }
  } catch (err: any) {
    return { stdout: err.stdout ?? '', stderr: err.stderr ?? '', code: err.status ?? 1 }
  }
}

describe('bump-version.sh — argument validation', () => {
  it('exits non-zero with no arguments', () => {
    const dir = makeFixture('1.0.0')
    const { code, stderr } = run('', dir)
    expect(code).not.toBe(0)
    expect(stderr).toMatch(/usage|argument|missing/i)
  })

  it('exits non-zero with an invalid argument', () => {
    const dir = makeFixture('1.0.0')
    const { code, stderr } = run('sideways', dir)
    expect(code).not.toBe(0)
    expect(stderr).toMatch(/invalid|must be|patch|minor|major/i)
  })
})

describe('bump-version.sh — patch bump', () => {
  let dir: string

  beforeEach(() => { dir = makeFixture('1.2.3') })

  it('updates patch version in package.json', () => {
    run('patch', dir)
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(pkg.version).toBe('1.2.4')
  })

  it('updates patch version in Cargo.toml', () => {
    run('patch', dir)
    const cargo = readFileSync(join(dir, 'src-tauri', 'Cargo.toml'), 'utf8')
    expect(cargo).toMatch(/^version = "1\.2\.4"/m)
  })

  it('updates patch version in tauri.conf.json', () => {
    run('patch', dir)
    const conf = JSON.parse(readFileSync(join(dir, 'src-tauri', 'tauri.conf.json'), 'utf8'))
    expect(conf.version).toBe('1.2.4')
  })

  it('prints old and new version', () => {
    const { stdout, code } = run('patch', dir)
    expect(code).toBe(0)
    expect(stdout).toMatch(/1\.2\.3/)
    expect(stdout).toMatch(/1\.2\.4/)
  })
})

describe('bump-version.sh — minor bump', () => {
  it('resets patch and increments minor', () => {
    const dir = makeFixture('1.2.3')
    run('minor', dir)
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(pkg.version).toBe('1.3.0')
  })
})

describe('bump-version.sh — major bump', () => {
  it('resets minor and patch, increments major', () => {
    const dir = makeFixture('1.2.3')
    run('major', dir)
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    expect(pkg.version).toBe('2.0.0')
  })
})
