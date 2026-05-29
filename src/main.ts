import { newGame, slide, isWin, isLoss, spawnTile } from './board'
import type { GameState, Direction } from './board'
import { renderBoard, renderScore, showOverlay, hideOverlay } from './render'
import { registerSwipeHandler } from './input'
import { createKeyHandler } from './keyboard'

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

function performSlide(dir: Direction) {
  const { boardContainer, scoreEl, overlay } = getElements()
  const result = slide(state.board, dir)
  if (!result.moved) return

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
  const elements = getElements()
  const handleKey = createKeyHandler(
    () => state,
    (s) => { state = s },
    elements,
    start,
  )
  window.addEventListener('keydown', handleKey)
  const { boardContainer, overlay } = getElements()
  registerSwipeHandler(boardContainer, overlay, performSlide)
})
