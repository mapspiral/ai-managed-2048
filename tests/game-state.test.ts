import { describe, expect, it } from 'vitest'
import type { Board } from '../src/board'
import { isWin, isLoss, newGame } from '../src/board'

describe('isWin', () => {
  it('returns true when any cell contains 2048', () => {
    const b: Board = [
      [2048, 4, 8, 16],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    expect(isWin(b)).toBe(true)
  })

  it('returns true when 2048 is not in the first cell', () => {
    const b: Board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, null],
      [null, null, null, null],
    ]
    expect(isWin(b)).toBe(true)
  })

  it('returns false when no cell contains 2048', () => {
    const b: Board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, null, null],
      [null, null, null, null],
    ]
    expect(isWin(b)).toBe(false)
  })

  it('returns false for an empty board', () => {
    const b: Board = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    expect(isWin(b)).toBe(false)
  })
})

describe('isLoss', () => {
  it('returns false when there are empty cells', () => {
    const b: Board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, null, null],
      [null, null, null, null],
    ]
    expect(isLoss(b)).toBe(false)
  })

  it('returns true for a full board with no adjacent equal tiles', () => {
    const b: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]
    expect(isLoss(b)).toBe(true)
  })

  it('returns false for a full board with a horizontal merge available', () => {
    const b: Board = [
      [2, 2, 4, 8],
      [4, 8, 16, 32],
      [64, 128, 256, 512],
      [1024, 512, 256, 128],
    ]
    expect(isLoss(b)).toBe(false)
  })

  it('returns false for a full board with a vertical merge available', () => {
    const b: Board = [
      [2, 4, 8, 16],
      [2, 8, 16, 32],
      [4, 64, 128, 256],
      [8, 128, 256, 512],
    ]
    expect(isLoss(b)).toBe(false)
  })
})

describe('newGame', () => {
  it('returns an object with a board and score 0', () => {
    const { board, score } = newGame()
    expect(score).toBe(0)
    expect(board).toHaveLength(4)
    board.forEach(row => expect(row).toHaveLength(4))
  })

  it('board has exactly two tiles spawned', () => {
    const { board } = newGame()
    const filled = board.flat().filter(c => c !== null)
    expect(filled).toHaveLength(2)
  })

  it('each call returns a fresh independent board', () => {
    const a = newGame()
    const b = newGame()
    // Modifying one should not affect the other
    a.board[0][0] = 9999
    expect(b.board[0][0]).not.toBe(9999)
  })
})
