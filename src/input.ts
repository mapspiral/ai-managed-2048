import type { Direction } from './board'

const MIN_DRAG_PX = 30

export function registerSwipeHandler(
  element: HTMLElement,
  overlay: HTMLElement,
  onSwipe: (direction: Direction) => void,
): void {
  let startX = 0
  let startY = 0

  element.addEventListener('pointerdown', (e: PointerEvent) => {
    startX = e.clientX
    startY = e.clientY
  })

  element.addEventListener('pointerup', (e: PointerEvent) => {
    if (!overlay.hidden) return

    const dx = e.clientX - startX
    const dy = e.clientY - startY
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)

    if (adx < MIN_DRAG_PX && ady < MIN_DRAG_PX) return

    let direction: Direction
    if (adx >= ady) {
      direction = dx > 0 ? 'right' : 'left'
    } else {
      direction = dy > 0 ? 'down' : 'up'
    }

    onSwipe(direction)
  })
}
