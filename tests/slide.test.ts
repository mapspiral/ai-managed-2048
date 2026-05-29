import { describe, expect, it } from 'vitest'
import type { Board } from '../src/board'
import { slide } from '../src/board'

describe('slide — return shape', () => {
  it('returns { board, score, moved } for all four directions', () => {
    const b: Board = [
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    for (const dir of ['left', 'right', 'up', 'down'] as const) {
      const result = slide(b, dir)
      expect(result).toHaveProperty('board')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('moved')
      expect(result.board).toHaveLength(4)
      result.board.forEach(row => expect(row).toHaveLength(4))
      expect(typeof result.score).toBe('number')
      expect(typeof result.moved).toBe('boolean')
    }
  })
})

describe('slide — no merge (slide to edge)', () => {
  it('slides tiles left with no merge', () => {
    const b: Board = [
      [null, null, 2, 4],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score, moved } = slide(b, 'left')
    expect(result[0]).toEqual([2, 4, null, null])
    expect(score).toBe(0)
    expect(moved).toBe(true)
  })

  it('slides tiles right with no merge', () => {
    const b: Board = [
      [2, 4, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score, moved } = slide(b, 'right')
    expect(result[0]).toEqual([null, null, 2, 4])
    expect(score).toBe(0)
    expect(moved).toBe(true)
  })

  it('slides tiles up with no merge', () => {
    const b: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [2, null, null, null],
      [4, null, null, null],
    ]
    const { board: result, score, moved } = slide(b, 'up')
    expect(result[0][0]).toBe(2)
    expect(result[1][0]).toBe(4)
    expect(result[2][0]).toBeNull()
    expect(result[3][0]).toBeNull()
    expect(score).toBe(0)
    expect(moved).toBe(true)
  })

  it('slides tiles down with no merge', () => {
    const b: Board = [
      [2, null, null, null],
      [4, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score, moved } = slide(b, 'down')
    expect(result[0][0]).toBeNull()
    expect(result[1][0]).toBeNull()
    expect(result[2][0]).toBe(2)
    expect(result[3][0]).toBe(4)
    expect(score).toBe(0)
    expect(moved).toBe(true)
  })
})

describe('slide — single merge', () => {
  it('merges two equal adjacent tiles sliding left', () => {
    const b: Board = [
      [2, 2, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score, moved } = slide(b, 'left')
    expect(result[0]).toEqual([4, null, null, null])
    expect(score).toBe(4)
    expect(moved).toBe(true)
  })

  it('slides tiles together across a gap then merges', () => {
    const b: Board = [
      [2, null, 2, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score, moved } = slide(b, 'left')
    expect(result[0]).toEqual([4, null, null, null])
    expect(score).toBe(4)
    expect(moved).toBe(true)
  })
})

describe('slide — chain prevention', () => {
  it('does not merge a newly merged tile with the next tile in the same move', () => {
    const b: Board = [
      [2, 2, 4, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score } = slide(b, 'left')
    // 2+2 merges to 4; that merged 4 must not merge with the existing 4
    expect(result[0]).toEqual([4, 4, null, null])
    expect(score).toBe(4)
  })

  it('merges pairs left-to-right: [2,2,2,2] → [4,4,null,null]', () => {
    const b: Board = [
      [2, 2, 2, 2],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score } = slide(b, 'left')
    expect(result[0]).toEqual([4, 4, null, null])
    expect(score).toBe(8)
  })
})

describe('slide — no-op detection', () => {
  it('moved is false when tiles are already packed with no merges possible', () => {
    const b: Board = [
      [2, 4, 8, 16],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { moved, score } = slide(b, 'left')
    expect(moved).toBe(false)
    expect(score).toBe(0)
  })

  it('moved is false for an empty board', () => {
    const b: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { moved, score } = slide(b, 'left')
    expect(moved).toBe(false)
    expect(score).toBe(0)
  })

  it('moved is false when right-packed board slides right', () => {
    const b: Board = [
      [null, null, 2, 4],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { moved } = slide(b, 'right')
    expect(moved).toBe(false)
  })
})

describe('slide — score tracking', () => {
  it('score equals the sum of all merged tile values', () => {
    const b: Board = [
      [2, 2, 4, 4],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { board: result, score } = slide(b, 'left')
    // [2,2,4,4] → [4,8,null,null], score = 4+8 = 12
    expect(result[0]).toEqual([4, 8, null, null])
    expect(score).toBe(12)
  })

  it('score sums merges across multiple rows', () => {
    const b: Board = [
      [2, 2, null, null],
      [4, 4, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const { score } = slide(b, 'left')
    expect(score).toBe(4 + 8)
  })
})
