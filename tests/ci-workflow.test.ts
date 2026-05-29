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

  it('has a cargo-nextest step running with --profile ci', () => {
    const steps = allSteps(wf)
    const testStep = steps.find(
      (s) => typeof s?.run === 'string' && /cargo nextest run/.test(s.run) && /--profile ci/.test(s.run),
    )
    expect(testStep).toBeDefined()
  })

  it('installs cargo-nextest via taiki-e/install-action', () => {
    const steps = allSteps(wf)
    const installStep = steps.find(
      (s) => typeof s?.uses === 'string' && /taiki-e\/install-action/.test(s.uses) && /nextest/.test(s.uses),
    )
    expect(installStep).toBeDefined()
  })
})

describe('vitest step', () => {
  it('has a Vitest step', () => {
    const steps = allSteps(wf)
    const vitestStep = steps.find(
      (s) => typeof s?.run === 'string' && /vitest run/.test(s.run),
    )
    expect(vitestStep).toBeDefined()
  })

  it('Vitest step uses JUnit reporter with outputFile', () => {
    const steps = allSteps(wf)
    const vitestStep = steps.find(
      (s) => typeof s?.run === 'string' && /vitest run/.test(s.run),
    )
    expect(vitestStep?.run).toMatch(/--reporter=junit/)
    expect(vitestStep?.run).toMatch(/--outputFile=test-results\/vitest\.xml/)
  })
})

describe('test result publishing', () => {
  it('publishes Vitest results via dorny/test-reporter with if: always()', () => {
    const steps = allSteps(wf)
    const publishStep = steps.find(
      (s) => typeof s?.uses === 'string' && /dorny\/test-reporter/.test(s.uses)
        && s?.with?.path?.includes('vitest.xml'),
    )
    expect(publishStep).toBeDefined()
    expect(publishStep?.if).toMatch(/always/)
  })

  it('publishes Rust results via dorny/test-reporter with if: always()', () => {
    const steps = allSteps(wf)
    const publishStep = steps.find(
      (s) => typeof s?.uses === 'string' && /dorny\/test-reporter/.test(s.uses)
        && s?.with?.path?.includes('nextest.xml'),
    )
    expect(publishStep).toBeDefined()
    expect(publishStep?.if).toMatch(/always/)
  })
})

describe('check job permissions', () => {
  it('check job has checks: write permission', () => {
    const checkJob = wf?.jobs?.check
    expect(checkJob?.permissions?.checks).toBe('write')
  })

  it('check job has contents: read permission', () => {
    const checkJob = wf?.jobs?.check
    expect(checkJob?.permissions?.contents).toBe('read')
  })
})

describe('arch-check step', () => {
  it('has a step that runs scripts/arch-check.sh', () => {
    const steps = allSteps(wf)
    const archCheckStep = steps.find(
      (s) => typeof s?.run === 'string' && /arch-check\.sh/.test(s.run),
    )
    expect(archCheckStep).toBeDefined()
  })

  it('arch-check step does not use continue-on-error', () => {
    const steps = allSteps(wf)
    const archCheckStep = steps.find(
      (s) => typeof s?.run === 'string' && /arch-check\.sh/.test(s.run),
    )
    expect(archCheckStep?.['continue-on-error']).not.toBe(true)
  })
})

function allSteps(workflow: any): any[] {
  if (!workflow?.jobs) return []
  return Object.values(workflow.jobs).flatMap((job: any) => job?.steps ?? [])
}
