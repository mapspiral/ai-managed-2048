export type Board = (number | null)[][]
export type Direction = 'left' | 'right' | 'up' | 'down'
export type SlideResult = { board: Board; score: number; moved: boolean }

export function spawnTile(board: Board): Board | null {
  const empty: [number, number][] = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === null) empty.push([r, c])
    }
  }
  if (empty.length === 0) return null

  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const value = Math.random() < 0.9 ? 2 : 4
  const next = board.map(row => [...row])
  next[r][c] = value
  return next
}

export function createBoard(): Board {
  let board: Board = Array.from({ length: 4 }, () => Array(4).fill(null))
  board = spawnTile(board)!
  board = spawnTile(board)!
  return board
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map(row => row[c]))
}

function reverseRows(board: Board): Board {
  return board.map(row => [...row].reverse())
}

function prepare(board: Board, dir: Direction): Board {
  if (dir === 'left') return board
  if (dir === 'right') return reverseRows(board)
  if (dir === 'up') return transpose(board)
  return reverseRows(transpose(board))
}

function restore(board: Board, dir: Direction): Board {
  if (dir === 'left') return board
  if (dir === 'right') return reverseRows(board)
  if (dir === 'up') return transpose(board)
  return transpose(reverseRows(board))
}

function slideRowLeft(row: (number | null)[]): { row: (number | null)[]; score: number } {
  const values = row.filter((v): v is number => v !== null)
  const result: (number | null)[] = []
  let score = 0
  let i = 0
  while (i < values.length) {
    if (i + 1 < values.length && values[i] === values[i + 1]) {
      const merged = values[i] * 2
      result.push(merged)
      score += merged
      i += 2
    } else {
      result.push(values[i])
      i++
    }
  }
  while (result.length < 4) result.push(null)
  return { row: result, score }
}

export function slide(board: Board, direction: Direction): SlideResult {
  const prepared = prepare(board, direction)
  let totalScore = 0
  const slid = prepared.map(row => {
    const { row: newRow, score } = slideRowLeft(row)
    totalScore += score
    return newRow
  })
  const result = restore(slid, direction)
  const moved = board.some((row, r) => row.some((cell, c) => cell !== result[r][c]))
  return { board: result, score: totalScore, moved }
}
