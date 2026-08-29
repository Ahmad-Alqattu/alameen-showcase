import { useEffect, useRef, useState } from 'react'
import { productImg } from '../data'
import type { Product } from '../types'

/**
 * The card preview: a slow crossfade through a product's own screenshots.
 *
 * No competitor audited for this project shows a single product screenshot —
 * not one of nine Saudi govtech vendors, and none of the GCC set. Putting real
 * UI on the card is the cheapest differentiator available, and it costs no new
 * bytes: these are the same files the product page already loads.
 *
 * Only visible cards cycle, and each starts on its own offset so the grid never
 * flips in unison, which would read as a broken page rather than as motion.
 */
export function CardPreview({ product, count = 4 }: { product: Product; count?: number }) {
  const shots = product.imgs.slice(0, count)
  const [i, setI] = useState(0)
  const [live, setLive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!live || shots.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // a per-product offset keeps the grid from pulsing as one
    const offset = (product.slug.charCodeAt(0) % 5) * 600
    const start = setTimeout(() => {
      setI((v) => (v + 1) % shots.length)
    }, offset)
    const id = setInterval(() => setI((v) => (v + 1) % shots.length), 4200)
    return () => { clearTimeout(start); clearInterval(id) }
  }, [live, shots.length, product.slug])

  if (!shots.length) return null

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-xl bg-tint border border-line aspect-[16/10]
        [background-image:radial-gradient(rgb(0_84_160/.12)_1px,transparent_1.4px)] [background-size:18px_18px]"
    >
      {shots.map((s, n) => (
        <img
          key={s.f}
          src={productImg(product.slug, s.f)}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden={n !== i}
          className={`absolute inset-0 m-auto max-w-[92%] max-h-[88%] object-contain rounded-md bg-white
            shadow-[0_10px_28px_-10px_rgb(9_45_92/.45)] transition-opacity duration-700 ${
              n === i ? 'opacity-100' : 'opacity-0'
            }`}
        />
      ))}
    </div>
  )
}
