import { useEffect } from 'react'
import { I18nProvider } from './i18n'
import { useHashRoute, goHome } from './hooks/useHashRoute'
import { SHOWCASE } from './data'
import { Atmo, Topbar, Footer } from './components/Chrome'
import { Home } from './components/Home'
import { ProductView } from './components/ProductView'

const IDLE_MS = 150_000

/** Kiosk mode: an abandoned product page returns to the grid on its own. */
function useIdleReset(active: boolean) {
  useEffect(() => {
    if (!active) return
    let t: number
    const reset = () => {
      clearTimeout(t)
      t = window.setTimeout(goHome, IDLE_MS)
    }
    const evs = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'] as const
    evs.forEach((e) => document.addEventListener(e, reset, { passive: true }))
    reset()
    return () => {
      clearTimeout(t)
      evs.forEach((e) => document.removeEventListener(e, reset))
    }
  }, [active])
}

function Shell() {
  const slug = useHashRoute()
  const product = slug ? SHOWCASE.products.find((p) => p.slug === slug) : undefined
  useIdleReset(!!product)
  // NB: keep the braces — Chromium's scrollTo now returns a Promise, and a
  // concise arrow would hand it to React as the effect "cleanup" and crash.
  useEffect(() => { window.scrollTo(0, 0) }, [slug])
  return (
    <>
      <Atmo />
      <div className="relative z-[2]">
        <Topbar />
        {product ? <ProductView key={product.slug} product={product} /> : <Home />}
        <Footer />
      </div>
    </>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  )
}
