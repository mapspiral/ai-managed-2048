import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { load as parseYaml } from 'js-yaml'
import { describe, expect, it, beforeAll } from 'vitest'

const ROOT = join(import.meta.dirname, '..')
const WORKFLOW_PATH = join(ROOT, '.github', 'workflows', 'pr.yml')

let wf: any

beforeAll(() => {
  if (existsSync(WORKFLOW_PATH)) {
    wf = parseYaml(readFileSync(WORKFLOW_PATH, 'utf8'))
  }
})

describe('.github/workflows/pr.yml', () => {
  it('exists', () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true)
  })

  it('triggers on pull_request to main', () => {
    expect(wf?.on?.pull_request?.branches).toContain('main')
  })

  it('has at least one job', () => {
    expect(Object.keys(wf?.jobs ?? {}).length).toBeGreaterThan(0)
  })
})

describe('pnpm install step', () => {
  it('runs pnpm install with --frozen-lockfile', () => {
    const steps: any[] = allSteps(wf)
    const installStep = steps.find(
      (s) => typeof s?.run === 'string' && /pnpm install/.test(s.run),
    )
    expect(installStep).toBeDefined()
    expect(installStep.run).toMatch(/--frozen-lockfile/)
  })
})

describe('lint and typecheck steps', () => {
  it('has an ESLint or equivalent lint step', () => {
    const steps = allSteps(wf)
    const lintStep = steps.find(
      (s) => typeof s?.run === 'string' && /eslint|pnpm.*lint/i.test(s.run),
    )
    expect(lintStep).toBeDefined()
  })

  it('has a TypeScript typecheck step (tsc --noEmit)', () => {
    const steps = allSteps(wf)
    const tscStep = steps.find(
      (s) => typeof s?.run === 'string' && /tsc.*--noEmit|--noEmit.*tsc/i.test(s.run),
    )
    expect(tscStep).toBeDefined()
  })

  it('lint step does not use continue-on-error', () => {
    const steps = allSteps(wf)
    const lintStep = steps.find(
      (s) => typeof s?.run === 'string' && /eslint|pnpm.*lint/i.test(s.run),
    )
    expect(lintStep?.['continue-on-error']).not.toBe(true)
  })

  it('typecheck step does not use continue-on-error', () => {
    const steps = allSteps(wf)
    const tscStep = steps.find(
      (s) => typeof s?.run === 'string' && /tsc.*--noEmit|--noEmit.*tsc/i.test(s.run),
    )
    expect(tscStep?.['continue-on-error']).not.toBe(true)
  })
})

describe('cargo steps', () => {
  it('has a cargo build step', () => {
    const steps = allSteps(wf)
    const buildStep = steps.find(
      (s) => typeof s?.run === 'string' && /cargo build/.test(s.run),
    )
    expect(buildStep).toBeDefined()
  })

  it('has a cargo test step', () => {
    const steps = allSteps(wf)
    const testStep = steps.find(
      (s) => typeof s?.run === 'string' && /cargo test/.test(s.run),
    )
    expect(testStep).toBeDefined()
  })
})

function allSteps(workflow: any): any[] {
  if (!workflow?.jobs) return []
  return Object.values(workflow.jobs).flatMap((job: any) => job?.steps ?? [])
}
