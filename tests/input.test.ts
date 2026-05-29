// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerSwipeHandler } from '../src/input'

function makeElements() {
  const element = document.createElement('div')
  const overlay = document.createElement('div')
  overlay.hidden = true
  return { element, overlay }
}

function swipe(element: HTMLElement, x0: number, y0: number, x1: number, y1: number) {
  element.dispatchEvent(new PointerEvent('pointerdown', { clientX: x0, clientY: y0, bubbles: true }))
  element.dispatchEvent(new PointerEvent('pointerup', { clientX: x1, clientY: y1, bubbles: true }))
}

describe('swipe handler — criterion 1: ≥30px cardinal drag triggers callback', () => {
  it('triggers "right" for a rightward drag of exactly 30px', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 30, 0)
    expect(onSwipe).toHaveBeenCalledWith('right')
  })

  it('triggers "left" for a leftward drag of exactly 30px', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 100, 0, 70, 0)
    expect(onSwipe).toHaveBeenCalledWith('left')
  })

  it('triggers "down" for a downward drag of exactly 30px', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 0, 30)
    expect(onSwipe).toHaveBeenCalledWith('down')
  })

  it('triggers "up" for an upward drag of exactly 30px', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 100, 0, 70)
    expect(onSwipe).toHaveBeenCalledWith('up')
  })

  it('does not trigger for a drag of 29px', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 29, 0)
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('does not trigger when both deltas are below threshold', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 10, 10)
    expect(onSwipe).not.toHaveBeenCalled()
  })
})

describe('swipe handler — criterion 2: diagonal gestures resolve to dominant axis', () => {
  it('resolves to "right" when horizontal delta is larger', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 50, 20)
    expect(onSwipe).toHaveBeenCalledWith('right')
  })

  it('resolves to "down" when vertical delta is larger', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 20, 50)
    expect(onSwipe).toHaveBeenCalledWith('down')
  })

  it('resolves to "left" when leftward delta dominates', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 100, 100, 50, 120)
    expect(onSwipe).toHaveBeenCalledWith('left')
  })

  it('resolves to "up" when upward delta dominates', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 100, 100, 120, 50)
    expect(onSwipe).toHaveBeenCalledWith('up')
  })
})

describe('swipe handler — criterion 3: ignored when overlay is visible', () => {
  it('does not trigger when overlay is visible (hidden = false)', () => {
    const { element, overlay } = makeElements()
    overlay.hidden = false
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 100, 0)
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('triggers normally after overlay is hidden again', () => {
    const { element, overlay } = makeElements()
    overlay.hidden = false
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    swipe(element, 0, 0, 100, 0)
    expect(onSwipe).not.toHaveBeenCalled()

    overlay.hidden = true
    swipe(element, 0, 0, 100, 0)
    expect(onSwipe).toHaveBeenCalledWith('right')
  })
})

describe('swipe handler — criterion 4: Pointer Events API (mouse and touch)', () => {
  it('responds to PointerEvent (covers both mouse and touch input paths)', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerType: 'touch', bubbles: true }))
    element.dispatchEvent(new PointerEvent('pointerup', { clientX: 50, clientY: 0, pointerType: 'touch', bubbles: true }))
    expect(onSwipe).toHaveBeenCalledWith('right')
  })

  it('responds to mouse pointer type', () => {
    const { element, overlay } = makeElements()
    const onSwipe = vi.fn()
    registerSwipeHandler(element, overlay, onSwipe)
    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerType: 'mouse', bubbles: true }))
    element.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 50, pointerType: 'mouse', bubbles: true }))
    expect(onSwipe).toHaveBeenCalledWith('down')
  })
})
