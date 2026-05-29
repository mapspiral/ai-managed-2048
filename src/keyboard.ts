import { slide, spawnTile, isWin, isLoss } from './board'
import type { GameState } from './board'
import { renderBoard, renderScore, showOverlay } from './render'

const DIR_MAP: Record<string, 'left' | 'right' | 'up' | 'down'> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
}

export function createKeyHandler(
  getState: () => GameState,
  setState: (s: GameState) => void,
  elements: { boardContainer: HTMLElement; scoreEl: HTMLElement; overlay: HTMLElement },
  onNewGame: () => void,
): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (!elements.overlay.hidden) return

    const dir = DIR_MAP[e.key]
    if (!dir) return

    const state = getState()
    const result = slide(state.board, dir)
    if (!result.moved) return

    const spawned = spawnTile(result.board) ?? result.board
    const newState = { board: spawned, score: state.score + result.score }
    setState(newState)
    renderBoard(elements.boardContainer, newState.board)
    renderScore(elements.scoreEl, newState.score)

    if (isWin(newState.board)) {
      showOverlay(elements.overlay, 'win', onNewGame)
    } else if (isLoss(newState.board)) {
      showOverlay(elements.overlay, 'loss', onNewGame)
    }
  }
}
