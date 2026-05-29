import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it } from 'vitest'

const ROOT = join(import.meta.dirname, '..')
const CAPABILITIES_DIR = join(ROOT, 'src-tauri', 'capabilities')
const CAPABILITY_FILE = join(CAPABILITIES_DIR, 'default.json')

const FORBIDDEN_PERMISSIONS = [
  'opener:default',
  'opener:allow-open-url',
  'opener:allow-open-path',
  'opener:allow-reveal-item-in-dir',
]

describe('src-tauri/capabilities', () => {
  it('directory exists', () => {
    expect(existsSync(CAPABILITIES_DIR)).toBe(true)
  })

  it('contains at least one capability file', () => {
    const files = readdirSync(CAPABILITIES_DIR).filter((f) => f.endsWith('.json'))
    expect(files.length).toBeGreaterThan(0)
  })
})

describe('default capability file', () => {
  it('exists', () => {
    expect(existsSync(CAPABILITY_FILE)).toBe(true)
  })

  it('is valid JSON', () => {
    const content = readFileSync(CAPABILITY_FILE, 'utf8')
    expect(() => JSON.parse(content)).not.toThrow()
  })

  it('has an identifier field', () => {
    const cap = JSON.parse(readFileSync(CAPABILITY_FILE, 'utf8'))
    expect(cap.identifier).toBeDefined()
  })
})

describe('permission lockdown', () => {
  it('grants no filesystem permissions', () => {
    const cap = JSON.parse(readFileSync(CAPABILITY_FILE, 'utf8'))
    const perms: string[] = cap.permissions ?? []
    const fsPerms = perms.filter((p) => p.startsWith('fs:') || p.startsWith('core:fs'))
    expect(fsPerms).toHaveLength(0)
  })

  it('grants no network or URL-opening permissions', () => {
    const cap = JSON.parse(readFileSync(CAPABILITY_FILE, 'utf8'))
    const perms: string[] = cap.permissions ?? []
    const networkPerms = perms.filter(
      (p) => p.startsWith('opener:') || p.startsWith('http:'),
    )
    expect(networkPerms).toHaveLength(0)
  })

  it('grants no shell permissions', () => {
    const cap = JSON.parse(readFileSync(CAPABILITY_FILE, 'utf8'))
    const perms: string[] = cap.permissions ?? []
    const shellPerms = perms.filter((p) => p.startsWith('shell:'))
    expect(shellPerms).toHaveLength(0)
  })

  it('grants no dialog permissions', () => {
    const cap = JSON.parse(readFileSync(CAPABILITY_FILE, 'utf8'))
    const perms: string[] = cap.permissions ?? []
    const dialogPerms = perms.filter((p) => p.startsWith('dialog:'))
    expect(dialogPerms).toHaveLength(0)
  })

  it('does not include any explicitly forbidden permissions', () => {
    const cap = JSON.parse(readFileSync(CAPABILITY_FILE, 'utf8'))
    const perms: string[] = cap.permissions ?? []
    for (const forbidden of FORBIDDEN_PERMISSIONS) {
      expect(perms, `should not contain ${forbidden}`).not.toContain(forbidden)
    }
  })

  it('does not use core:default (which bundles unneeded permissions)', () => {
    const cap = JSON.parse(readFileSync(CAPABILITY_FILE, 'utf8'))
    const perms: string[] = cap.permissions ?? []
    expect(perms).not.toContain('core:default')
  })
})
