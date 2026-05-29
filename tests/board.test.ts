import { describe, expect, it } from 'vitest'
import type { Board } from '../src/board'
import { createBoard, spawnTile } from '../src/board'

describe('Board type', () => {
  it('is a 4×4 grid of nullable tile values', () => {
    const board: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    expect(board).toHaveLength(4)
    board.forEach(row => {
      expect(row).toHaveLength(4)
      row.forEach(cell => expect(cell === null || typeof cell === 'number').toBe(true))
    })
  })
})

describe('spawnTile', () => {
  it('places a tile (2 or 4) in a random empty cell', () => {
    const empty: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const result = spawnTile(empty)
    expect(result).not.toBeNull()
    const cells = result!.flat()
    const filled = cells.filter(c => c !== null)
    expect(filled).toHaveLength(1)
    expect([2, 4]).toContain(filled[0])
  })

  it('returns null when no empty cells exist', () => {
    const full: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(spawnTile(full)).toBeNull()
  })

  it('spawns 2 with ~90% probability and 4 with ~10% (statistical)', () => {
    const empty: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const counts = { 2: 0, 4: 0 }
    const trials = 1000
    for (let i = 0; i < trials; i++) {
      const result = spawnTile(empty)
      const value = result!.flat().find(c => c !== null) as 2 | 4
      counts[value]++
    }
    expect(counts[2] / trials).toBeGreaterThan(0.82)
    expect(counts[2] / trials).toBeLessThan(0.98)
    expect(counts[4] / trials).toBeGreaterThan(0.02)
    expect(counts[4] / trials).toBeLessThan(0.18)
  })
})

describe('createBoard', () => {
  it('returns a 4×4 grid', () => {
    const board = createBoard()
    expect(board).toHaveLength(4)
    board.forEach(row => expect(row).toHaveLength(4))
  })

  it('spawns exactly two initial tiles', () => {
    const board = createBoard()
    const filled = board.flat().filter(c => c !== null)
    expect(filled).toHaveLength(2)
  })

  it('does not spawn tiles when board is full (full board stays full)', () => {
    const full: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(spawnTile(full)).toBeNull()
  })
})
