import { useEffect } from 'react'
import { I18nProvider } from './i18n'
import { KioskProvider } from './kiosk'
import { useHashRoute } from './hooks/useHashRoute'
import { SHOWCASE } from './data'
import { Atmo, Topbar, Footer } from './components/Chrome'
import { Home } from './components/Home'
import { ProductView } from './components/ProductView'

function Shell() {
  const slug = useHashRoute()
  const product = slug ? SHOWCASE.products.find((p) => p.slug === slug) : undefined
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
      <KioskProvider>
        <Shell />
      </KioskProvider>
    </I18nProvider>
  )
}
