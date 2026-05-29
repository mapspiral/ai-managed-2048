// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import type { Board } from '../src/board'
import { renderBoard, renderScore, showOverlay, hideOverlay } from '../src/render'

describe('renderBoard — criterion 1', () => {
  it('renders exactly 16 tile elements', () => {
    const container = document.createElement('div')
    const board: Board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, null],
      [null, null, null, null],
    ]
    renderBoard(container, board)
    expect(container.querySelectorAll('.tile')).toHaveLength(16)
  })

  it('each tile shows the correct value', () => {
    const container = document.createElement('div')
    const board: Board = [
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, 8],
    ]
    renderBoard(container, board)
    const tiles = Array.from(container.querySelectorAll<HTMLElement>('.tile'))
    expect(tiles[0].textContent).toBe('2')
    expect(tiles[15].textContent).toBe('8')
  })

  it('null cells render with empty text content', () => {
    const container = document.createElement('div')
    const board: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    renderBoard(container, board)
    const tiles = Array.from(container.querySelectorAll<HTMLElement>('.tile'))
    tiles.forEach(t => expect(t.textContent).toBe(''))
  })

  it('each tile with a value has a value-specific CSS class', () => {
    const container = document.createElement('div')
    const board: Board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, null],
      [null, null, null, null],
    ]
    renderBoard(container, board)
    const tiles = Array.from(container.querySelectorAll<HTMLElement>('.tile'))
    expect(tiles[0].classList.contains('tile-2')).toBe(true)
    expect(tiles[1].classList.contains('tile-4')).toBe(true)
    expect(tiles[3].classList.contains('tile-16')).toBe(true)
    expect(tiles[10].classList.contains('tile-2048')).toBe(true)
    expect(tiles[11].classList.contains('tile-empty')).toBe(true)
  })

  it('re-renders the board on repeated calls (no duplicate tiles)', () => {
    const container = document.createElement('div')
    const board: Board = [
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    renderBoard(container, board)
    renderBoard(container, board)
    expect(container.querySelectorAll('.tile')).toHaveLength(16)
  })
})

describe('renderScore — criterion 2', () => {
  it('sets score element textContent to the score', () => {
    const el = document.createElement('span')
    renderScore(el, 42)
    expect(el.textContent).toBe('42')
  })

  it('updates score on repeated calls', () => {
    const el = document.createElement('span')
    renderScore(el, 0)
    renderScore(el, 128)
    expect(el.textContent).toBe('128')
  })
})

describe('showOverlay — criterion 3', () => {
  it('shows win message when type is "win"', () => {
    const container = document.createElement('div')
    showOverlay(container, 'win', () => {})
    expect(container.textContent).toMatch(/you win/i)
  })

  it('shows lose message when type is "loss"', () => {
    const container = document.createElement('div')
    showOverlay(container, 'loss', () => {})
    expect(container.textContent).toMatch(/game over/i)
  })

  it('overlay is visible (not hidden) after showOverlay', () => {
    const container = document.createElement('div')
    container.hidden = true
    showOverlay(container, 'win', () => {})
    expect(container.hidden).toBe(false)
  })
})

describe('showOverlay — criterion 4', () => {
  it('overlay contains a New Game button', () => {
    const container = document.createElement('div')
    showOverlay(container, 'win', () => {})
    const btn = container.querySelector('button')
    expect(btn).not.toBeNull()
    expect(btn!.textContent).toMatch(/new game/i)
  })

  it('clicking New Game button calls the callback', () => {
    const container = document.createElement('div')
    const onNewGame = vi.fn()
    showOverlay(container, 'win', onNewGame)
    const btn = container.querySelector<HTMLButtonElement>('button')!
    btn.click()
    expect(onNewGame).toHaveBeenCalledOnce()
  })
})

describe('hideOverlay — criterion 4', () => {
  it('hides the overlay container', () => {
    const container = document.createElement('div')
    showOverlay(container, 'win', () => {})
    hideOverlay(container)
    expect(container.hidden).toBe(true)
  })
})

describe('UI structure — criterion 5', () => {
  it('renderBoard wraps tiles in a board grid container', () => {
    const container = document.createElement('div')
    const board: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    renderBoard(container, board)
    expect(container.querySelector('.board-grid')).not.toBeNull()
  })
})
