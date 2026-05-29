export type Board = (number | null)[][]

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
