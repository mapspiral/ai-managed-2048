import { newGame, slide, isWin, isLoss, spawnTile } from './board'
import type { GameState } from './board'
import { renderBoard, renderScore, showOverlay, hideOverlay } from './render'

let state: GameState

function getElements() {
  return {
    boardContainer: document.getElementById('board-container')!,
    scoreEl: document.getElementById('score')!,
    overlay: document.getElementById('overlay')!,
  }
}

function start() {
  state = newGame()
  const { boardContainer, scoreEl, overlay } = getElements()
  hideOverlay(overlay)
  renderScore(scoreEl, state.score)
  renderBoard(boardContainer, state.board)
}

function handleKey(e: KeyboardEvent) {
  const { boardContainer, scoreEl, overlay } = getElements()
  const dirMap: Record<string, 'left' | 'right' | 'up' | 'down'> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  }
  const dir = dirMap[e.key]
  if (!dir) return

  const result = slide(state.board, dir)
  if (!result.moved) return

  e.preventDefault()
  const spawned = spawnTile(result.board) ?? result.board
  state = { board: spawned, score: state.score + result.score }
  renderBoard(boardContainer, state.board)
  renderScore(scoreEl, state.score)

  if (isWin(state.board)) {
    showOverlay(overlay, 'win', start)
  } else if (isLoss(state.board)) {
    showOverlay(overlay, 'loss', start)
  }
}

window.addEventListener('DOMContentLoaded', () => {
  start()
  window.addEventListener('keydown', handleKey)
})
