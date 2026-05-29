import type { Board } from './board'

export function renderBoard(container: HTMLElement, board: Board): void {
  let grid = container.querySelector<HTMLElement>('.board-grid')
  if (!grid) {
    grid = document.createElement('div')
    grid.className = 'board-grid'
    container.appendChild(grid)
  }
  grid.innerHTML = ''
  for (const row of board) {
    for (const cell of row) {
      const tile = document.createElement('div')
      tile.className = cell === null ? 'tile tile-empty' : `tile tile-${cell}`
      tile.textContent = cell === null ? '' : String(cell)
      grid.appendChild(tile)
    }
  }
}

export function renderScore(el: HTMLElement, score: number): void {
  el.textContent = String(score)
}

export function showOverlay(container: HTMLElement, type: 'win' | 'loss', onNewGame: () => void): void {
  container.innerHTML = ''
  const message = document.createElement('p')
  message.textContent = type === 'win' ? 'You Win!' : 'Game Over'
  const btn = document.createElement('button')
  btn.textContent = 'New Game'
  btn.addEventListener('click', onNewGame)
  container.appendChild(message)
  container.appendChild(btn)
  container.hidden = false
}

export function hideOverlay(container: HTMLElement): void {
  container.hidden = true
}
