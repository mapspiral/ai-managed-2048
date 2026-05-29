// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../src/board', () => ({
  slide: vi.fn(),
  spawnTile: vi.fn(),
  isWin: vi.fn(),
  isLoss: vi.fn(),
}))

vi.mock('../src/render', () => ({
  renderBoard: vi.fn(),
  renderScore: vi.fn(),
  showOverlay: vi.fn(),
}))

import { slide, spawnTile, isWin, isLoss } from '../src/board'
import { createKeyHandler } from '../src/keyboard'
import type { GameState } from '../src/board'

const emptyBoard = Array.from({ length: 4 }, () => Array(4).fill(null) as (number | null)[])
const mockState: GameState = { board: emptyBoard, score: 0 }

function makeElements(overlayHidden = true) {
  return {
    boardContainer: document.createElement('div'),
    scoreEl: document.createElement('span'),
    overlay: Object.assign(document.createElement('div'), { hidden: overlayHidden }),
  }
}

describe('keyboard handler — criterion 1: arrow keys trigger slide()', () => {
  beforeEach(() => {
    vi.mocked(slide).mockReturnValue({ board: emptyBoard, score: 0, moved: true })
    vi.mocked(spawnTile).mockReturnValue(emptyBoard)
    vi.mocked(isWin).mockReturnValue(false)
    vi.mocked(isLoss).mockReturnValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    ['ArrowLeft', 'left' as const],
    ['ArrowRight', 'right' as const],
    ['ArrowUp', 'up' as const],
    ['ArrowDown', 'down' as const],
  ])('%s triggers slide with direction "%s"', (key, dir) => {
    const handler = createKeyHandler(() => mockState, vi.fn(), makeElements(), vi.fn())
    handler(new KeyboardEvent('keydown', { key }))
    expect(slide).toHaveBeenCalledWith(emptyBoard, dir)
  })

  it('non-arrow keys do not trigger slide()', () => {
    const handler = createKeyHandler(() => mockState, vi.fn(), makeElements(), vi.fn())
    handler(new KeyboardEvent('keydown', { key: 'Space' }))
    expect(slide).not.toHaveBeenCalled()
  })
})

describe('keyboard handler — criterion 2: no spawn or score change when not moved', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not call spawnTile when moved is false', () => {
    vi.mocked(slide).mockReturnValue({ board: emptyBoard, score: 0, moved: false })
    const handler = createKeyHandler(() => mockState, vi.fn(), makeElements(), vi.fn())
    handler(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(spawnTile).not.toHaveBeenCalled()
  })

  it('does not update state when moved is false', () => {
    vi.mocked(slide).mockReturnValue({ board: emptyBoard, score: 0, moved: false })
    const setState = vi.fn()
    const handler = createKeyHandler(() => mockState, setState, makeElements(), vi.fn())
    handler(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(setState).not.toHaveBeenCalled()
  })
})

describe('keyboard handler — criterion 3: ignore keys when overlay is visible', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not call slide when overlay is visible', () => {
    const handler = createKeyHandler(() => mockState, vi.fn(), makeElements(false), vi.fn())
    handler(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(slide).not.toHaveBeenCalled()
  })

  it('calls slide when overlay is hidden', () => {
    vi.mocked(slide).mockReturnValue({ board: emptyBoard, score: 0, moved: true })
    vi.mocked(spawnTile).mockReturnValue(emptyBoard)
    vi.mocked(isWin).mockReturnValue(false)
    vi.mocked(isLoss).mockReturnValue(false)
    const handler = createKeyHandler(() => mockState, vi.fn(), makeElements(true), vi.fn())
    handler(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(slide).toHaveBeenCalledOnce()
  })
})

describe('keyboard handler — criterion 4: prevent default scroll on arrow keys', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it.each(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])(
    '%s prevents default even when move does not occur',
    (key) => {
      vi.mocked(slide).mockReturnValue({ board: emptyBoard, score: 0, moved: false })
      const event = new KeyboardEvent('keydown', { key, cancelable: true })
      const handler = createKeyHandler(() => mockState, vi.fn(), makeElements(), vi.fn())
      handler(event)
      expect(event.defaultPrevented).toBe(true)
    }
  )

  it('does not prevent default for non-arrow keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'Space', cancelable: true })
    const handler = createKeyHandler(() => mockState, vi.fn(), makeElements(), vi.fn())
    handler(event)
    expect(event.defaultPrevented).toBe(false)
  })
})
