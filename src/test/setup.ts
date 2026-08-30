import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

/**
 * jsdom implements neither of these. The AI band observes itself so its
 * typing demo only runs on screen; under test we report it as visible so the
 * component takes its normal path.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: readonly number[] = []
  constructor(private cb: IntersectionObserverCallback) {}
  observe(target: Element) {
    this.cb(
      [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
      this,
    )
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

/** jsdom gives elements no scrollTo; the thumbnail strip calls it on itself. */
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {}
}

if (!window.matchMedia) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  )
}
