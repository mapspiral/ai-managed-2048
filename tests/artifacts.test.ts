import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '..')

describe('docs/versioning.md', () => {
  it('exists', () => {
    expect(existsSync(join(ROOT, 'docs', 'versioning.md'))).toBe(true)
  })

  it('documents patch convention', () => {
    const content = readFileSync(join(ROOT, 'docs', 'versioning.md'), 'utf8')
    expect(content).toMatch(/patch/i)
    expect(content).toMatch(/bug fix|ci change|dependency|documentation/i)
  })

  it('documents minor convention', () => {
    const content = readFileSync(join(ROOT, 'docs', 'versioning.md'), 'utf8')
    expect(content).toMatch(/minor/i)
    expect(content).toMatch(/feature|user-facing/i)
  })

  it('documents major convention', () => {
    const content = readFileSync(join(ROOT, 'docs', 'versioning.md'), 'utf8')
    expect(content).toMatch(/major/i)
    expect(content).toMatch(/breaking/i)
  })
})

describe('CLAUDE.md', () => {
  it('exists', () => {
    expect(existsSync(join(ROOT, 'CLAUDE.md'))).toBe(true)
  })

  it('contains versioning rule', () => {
    const content = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8')
    expect(content).toMatch(/bump-version\.sh/i)
  })

  it('contains commit format rule', () => {
    const content = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8')
    expect(content).toMatch(/conventional commit/i)
  })

  it('contains test discipline rule', () => {
    const content = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8')
    expect(content).toMatch(/pnpm test/i)
    expect(content).toMatch(/cargo test/i)
  })
})
