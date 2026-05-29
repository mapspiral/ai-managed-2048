import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '..')
const DOCS_PATH = join(ROOT, 'docs', 'distribution.md')

describe('docs/distribution.md', () => {
  it('exists', () => {
    expect(existsSync(DOCS_PATH)).toBe(true)
  })

  it('explains how to install via Homebrew', () => {
    const content = readFileSync(DOCS_PATH, 'utf8')
    expect(content).toMatch(/brew install/i)
  })

  it('references the mapspiral/homebrew-tap tap', () => {
    const content = readFileSync(DOCS_PATH, 'utf8')
    expect(content).toMatch(/mapspiral\/homebrew-tap/)
  })

  it('documents the Homebrew tap add command', () => {
    const content = readFileSync(DOCS_PATH, 'utf8')
    expect(content).toMatch(/brew tap/)
  })

  it('explains the update cadence', () => {
    const content = readFileSync(DOCS_PATH, 'utf8')
    expect(content).toMatch(/update|cadence|release|automatic/i)
  })
})
