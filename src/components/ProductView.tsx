import { useCallback, useEffect, useRef, useState } from 'react'
import { hasArabic, useI18n } from '../i18n'
import { clientLogo, productImg, productLogo } from '../data'
import type { Product } from '../types'
import { Wrap, SectionLabel } from './Chrome'
import { Apps, Portals } from './Portals'
import { goHome } from '../hooks/useHashRoute'

const AUTOPLAY_MS = 6000

export function ProductView({ product: p }: { product: Product }) {
  const { t, L, Lx } = useI18n()
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(Date.now())
  const touchX = useRef<number | null>(null)

  const n = p.imgs.length
  const img = p.imgs[idx]

  const go = useCallback(
    (i: number, manual = false) => {
      setIdx(((i % n) + n) % n)
      if (manual) setPlaying(false)
      startRef.current = Date.now()
      setProgress(0)
    },
    [n],
  )

  /* autoplay + progress */
  useEffect(() => {
    if (!playing) { setProgress(0); return }
    startRef.current = Date.now()
    const tmr = setInterval(() => {
      const f = Math.min(1, (Date.now() - startRef.current) / AUTOPLAY_MS)
      setProgress(f)
      if (f >= 1) go(idx + 1)
    }, 120)
    return () => clearInterval(tmr)
  }, [playing, idx, go])

  /* preload the next image */
  useEffect(() => {
    const nx = new Image()
    nx.src = productImg(p.slug, p.imgs[(idx + 1) % n].f)
  }, [idx, n, p])

  /* keyboard */
  useEffect(() => {
    const on = (ev: KeyboardEvent) => {
      const rtl = document.documentElement.dir === 'rtl'
      if (ev.key === 'ArrowRight') go(idx + (rtl ? -1 : 1), true)
      else if (ev.key === 'ArrowLeft') go(idx + (rtl ? 1 : -1), true)
      else if (ev.key === 'Escape' && !document.fullscreenElement) goHome()
      else if (ev.key === ' ') { ev.preventDefault(); setPlaying(v => !v) }
    }
    document.addEventListener('keydown', on)
    return () => document.removeEventListener('keydown', on)
  }, [idx, go])

  /* keep the active thumbnail in view */
  useEffect(() => {
    thumbsRef.current?.children[idx]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [idx])

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else stageRef.current?.requestFullscreen()
  }

  return (
    <section className="min-h-screen">
      <Wrap>
        {/* header */}
        <div className="flex items-center gap-4.5 flex-wrap py-4">
          <button
            onClick={goHome}
            className="inline-flex items-center gap-2.5 text-[.88rem] font-semibold text-muted px-5 py-2.5 rounded-full border border-line-strong bg-white transition hover:text-brand hover:border-brand"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[15px] h-[15px] rtl:-scale-x-100">
              <path d="M19 12H5m7-7-7 7 7 7" />
            </svg>
            {t('back')}
          </button>
          <div className="flex items-center gap-4 flex-1 min-w-[280px]">
            <div className="w-[62px] h-[62px] rounded-2xl bg-white border border-line shadow-card flex items-center justify-center p-2">
              <img src={productLogo(p)} alt="" className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <h2 className="text-[clamp(1.1rem,2vw,1.5rem)] font-bold text-navy leading-snug">{L(p.name)}</h2>
              <div className="text-[.78rem] text-brand mt-0.5 font-medium tracking-wide">{Lx(p.name)}</div>
            </div>
            <span className="tag flex-none text-[.72rem] px-3 py-1 rounded-full border border-brand/45 text-brand bg-brand/5 font-medium">
              {L(p.sector)}
            </span>
          </div>
        </div>

        {/* stage */}
        <div
          ref={stageRef}
          className="stage-dots stage-fs relative rounded-card overflow-hidden bg-tint border border-line-strong h-[min(60vh,700px)] flex items-center justify-center
            [background-image:radial-gradient(700px_300px_at_50%_0%,rgb(0_120_233/.06),transparent_60%)]"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (Math.abs(dx) >= 40) go(idx + (dx < 0 ? 1 : -1), true)
          }}
        >
          <div
            className="absolute top-0 start-0 h-[3px] bg-gradient-to-r from-cyan to-brand z-[6] transition-[width] duration-300 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
          <img
            key={img.f}
            src={productImg(p.slug, img.f)}
            alt={img.cap ? L(img.cap) : L(p.name)}
            className="relative z-[1] object-contain rounded-lg bg-white shadow-[0_24px_60px_-18px_rgb(9_45_92/.4)] animate-[rise_.35s_ease_both]"
            style={{
              maxWidth: `min(calc(100% - 96px), ${Math.round(img.w * 1.6)}px)`,
              maxHeight: `min(calc(100% - 52px), ${Math.round(img.h * 1.6)}px)`,
            }}
          />
          {([['prev', -1], ['next', 1]] as const).map(([which, d]) => (
            <button
              key={which}
              aria-label={which}
              onClick={() => go(idx + d, true)}
              className={`absolute top-1/2 -translate-y-1/2 z-[5] w-[50px] h-[50px] rounded-full bg-white/90 border border-line-strong text-navy flex items-center justify-center shadow-[0_8px_24px_-8px_rgb(9_45_92/.3)] transition hover:bg-brand hover:border-brand hover:text-white ${
                which === 'prev' ? 'start-3.5' : 'end-3.5'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-5 h-5">
                {which === 'prev' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
              </svg>
            </button>
          ))}
          <div className="absolute bottom-3 start-1/2 translate-x-1/2 ltr:-translate-x-1/2 z-[5] flex items-center gap-1.5 bg-white/95 border border-line-strong rounded-full px-2 py-1.5 shadow-[0_8px_24px_-10px_rgb(9_45_92/.3)]">
            <button
              onClick={() => setPlaying((v) => !v)}
              aria-label="play/pause"
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-muted transition hover:text-brand hover:bg-brand/10"
            >
              {playing ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <span dir="ltr" className="font-mono text-[.82rem] tabular-nums text-muted px-2 min-w-[52px] text-center">
              {idx + 1} / {n}
            </span>
            <button
              onClick={fullscreen}
              aria-label="fullscreen"
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-muted transition hover:text-brand hover:bg-brand/10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[15px] h-[15px]">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>

        {/* caption */}
        {img.cap && (
          <div className="flex gap-3.5 items-baseline flex-wrap mt-3.5 px-4.5 py-3.5 rounded-[14px] bg-white border border-line min-h-14">
            <b className="text-[.95rem] font-bold text-navy">{L(img.cap)}</b>
            {img.note && <span className="text-[.86rem] text-muted font-light leading-7">{L(img.note)}</span>}
          </div>
        )}

        {/* thumbnails */}
        <div ref={thumbsRef} className="thumbs-scroll flex gap-2.5 overflow-x-auto pt-3.5 pb-2 px-0.5">
          {p.imgs.map((e, i) => (
            <button
              key={e.f}
              onClick={() => go(i, true)}
              className={`flex-none h-[70px] rounded-[10px] overflow-hidden border-2 bg-white transition ${
                i === idx
                  ? 'border-brand opacity-100 shadow-[0_4px_14px_-4px_rgb(0_120_233/.4)]'
                  : 'border-line opacity-60 hover:opacity-90'
              }`}
            >
              <img loading="lazy" src={productImg(p.slug, e.f)} alt="" className="h-full w-auto block min-w-[54px] object-cover" />
            </button>
          ))}
        </div>

        {p.portals && p.portals.length > 0 && <Portals portals={p.portals} />}
        {p.apps && p.apps.length > 0 && <Apps apps={p.apps} />}

        {/* details */}
        <div className="mt-4 pb-14 grid md:grid-cols-[minmax(300px,1.15fr)_minmax(300px,1fr)] grid-cols-1 gap-[clamp(22px,4vw,56px)]">
          <div>
            <SectionLabel k="aboutH" className="mb-4" />
            <p className="text-[.98rem] font-light leading-8 text-muted">{L(p.about)}</p>
            <div className="mt-5 inline-flex items-center gap-2.5 text-[.85rem] text-navy font-semibold px-4.5 py-2.5 rounded-xl bg-brand/5 border border-brand/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-4 h-4 text-brand flex-none">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              {L(p.client)}
            </div>
            {p.users && p.users.length > 0 && (
              <div className="mt-5.5">
                <SectionLabel k="usersH" className="mb-4" />
                <div className="flex flex-wrap gap-2">
                  {p.users.map((u) => (
                    <span
                      key={u.n[1]}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-line-strong text-[.83rem] font-semibold text-navy"
                    >
                      {u.l ? (
                        <img loading="lazy" src={clientLogo(u.l)} alt="" className="h-[26px] w-[26px] object-contain rounded-md bg-white" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-cyan" />
                      )}
                      {L(u.n)}
                    </span>
                  ))}
                </div>
                {p.usersNote && <div className="mt-2.5 text-[.78rem] text-faint font-light">{L(p.usersNote)}</div>}
              </div>
            )}
          </div>
          <div>
            <SectionLabel k="featsH" className="mb-4" />
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-2">
              {p.feats.map((f) => (
                <div
                  key={f[1]}
                  dir={hasArabic(L(f)) ? undefined : 'ltr'}
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-[.84rem] font-medium leading-7 bg-white border border-line text-ink transition hover:border-brand/50 before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:bg-brand before:mt-2 before:flex-none"
                >
                  {L(f)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  )
}
