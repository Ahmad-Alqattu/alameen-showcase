import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n'
import { SHOWCASE, SVC_COLOR, clientLogo } from '../data'
import type { Service } from '../types'

const NS = 'http://www.w3.org/2000/svg'

/**
 * Interactive coverage map: governorate shapes from the platform's GeoJSON,
 * location-pin markers carrying each client's logo, pan/zoom (wheel, drag,
 * pinch, buttons). Pins grow with sqrt(zoom), clamped to a screen-size band.
 * Imperative SVG inside an effect — the pan/zoom hot path stays off React.
 */
export function CoverageMap() {
  const { lang, t, L } = useI18n()
  const wrapRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)

  const svcLabel = (s: Service) =>
    ({ csc: t('legCsc'), mad: t('legMad'), both: t('legBoth'), water: t('legWater') })[s]

  useEffect(() => {
    const MAP = SHOWCASE.map
    const wrap = wrapRef.current!
    const tip = tipRef.current!
    const W = MAP.w
    const HOME = { x: -W * 0.03, y: -MAP.h * 0.02, w: W * 1.06, h: MAP.h * 1.04 }
    if (!viewRef.current) viewRef.current = { ...HOME }
    const view = viewRef.current

    wrap.querySelector('svg')?.remove()
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.style.position = 'absolute'
    svg.style.inset = '0'
    svg.style.width = '100%'
    svg.style.height = '100%'

    const PIN_S = 0.62
    function updateScale() {
      const k = view.w / W
      const pxPerUnit = (wrap.clientWidth || 1200) / view.w
      let s = PIN_S * Math.sqrt(k)
      s = Math.max(15 / (24 * pxPerUnit), Math.min(92 / (24 * pxPerUnit), s))
      svg.querySelectorAll('.gov-label').forEach((el) => el.setAttribute('font-size', (13 * k).toFixed(2)))
      svg.querySelectorAll('.pt-halo').forEach((el) =>
        el.setAttribute('r', (Number(el.getAttribute('data-r')) * k).toFixed(2)),
      )
      svg.querySelectorAll('.pin-g').forEach((el) => {
        const x = el.getAttribute('data-x'), y = el.getAttribute('data-y')
        el.setAttribute('transform', `translate(${x} ${y}) scale(${s.toFixed(3)}) translate(-12 -34)`)
      })
    }
    function applyView() {
      svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`)
      updateScale()
      tip.classList.remove('opacity-100')
    }

    for (const g of MAP.paths) {
      const p = document.createElementNS(NS, 'path')
      p.setAttribute('d', g.d)
      p.setAttribute('class', 'gov-path')
      p.setAttribute('fill', g.fill || '#e6eff9')
      const title = document.createElementNS(NS, 'title')
      title.textContent = lang === 'ar' ? g.nameAr : g.nameEn
      p.appendChild(title)
      svg.appendChild(p)
    }
    for (const g of MAP.paths) {
      if (!g.cx || g.area < 400) continue
      const tx = document.createElementNS(NS, 'text')
      tx.setAttribute('x', String(g.cx))
      tx.setAttribute('y', String(g.cy))
      tx.setAttribute('class', 'gov-label')
      tx.setAttribute('text-anchor', 'middle')
      tx.textContent = lang === 'ar' ? g.nameAr : g.nameEn
      svg.appendChild(tx)
    }

    const defs = document.createElementNS(NS, 'defs')
    svg.appendChild(defs)
    const pr = MAP.proj
    MAP.points.forEach((pt, pi) => {
      const x = +(((pt.lon - pr.lon0) / (pr.lon1 - pr.lon0)) * W).toFixed(1)
      const y = +(((pr.lat1 - pt.lat) / (pr.lat1 - pr.lat0)) * MAP.h).toFixed(1)
      const halo = document.createElementNS(NS, 'circle')
      halo.setAttribute('cx', String(x))
      halo.setAttribute('cy', String(y))
      halo.setAttribute('class', 'pt-halo')
      halo.setAttribute('fill', SVC_COLOR[pt.s])
      halo.setAttribute('data-r', pt.l ? '12' : '7')
      svg.appendChild(halo)

      const g = document.createElementNS(NS, 'g')
      g.setAttribute('class', 'pin-g')
      g.setAttribute('data-x', String(x))
      g.setAttribute('data-y', String(y))
      const body = document.createElementNS(NS, 'path')
      body.setAttribute('class', 'pin-body')
      body.setAttribute('d', 'M12 0C5.37 0 0 5.37 0 12c0 8.6 12 22 12 22s12-13.4 12-22C24 5.37 18.63 0 12 0z')
      body.setAttribute('fill', SVC_COLOR[pt.s])
      body.setAttribute('stroke', '#ffffff')
      body.setAttribute('stroke-width', '1.4')
      g.appendChild(body)
      const disc = document.createElementNS(NS, 'circle')
      disc.setAttribute('cx', '12')
      disc.setAttribute('cy', '12')
      disc.setAttribute('r', '9.3')
      disc.setAttribute('fill', '#ffffff')
      g.appendChild(disc)
      if (pt.l) {
        const clip = document.createElementNS(NS, 'clipPath')
        clip.setAttribute('id', `mclip${pi}`)
        const cc = document.createElementNS(NS, 'circle')
        cc.setAttribute('cx', '12')
        cc.setAttribute('cy', '12')
        cc.setAttribute('r', '8.6')
        clip.appendChild(cc)
        defs.appendChild(clip)
        const img = document.createElementNS(NS, 'image')
        img.setAttribute('href', clientLogo(pt.l))
        img.setAttribute('x', '3.4')
        img.setAttribute('y', '3.4')
        img.setAttribute('width', '17.2')
        img.setAttribute('height', '17.2')
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        img.setAttribute('clip-path', `url(#mclip${pi})`)
        img.style.pointerEvents = 'none'
        g.appendChild(img)
      } else {
        const dot = document.createElementNS(NS, 'circle')
        dot.setAttribute('cx', '12')
        dot.setAttribute('cy', '12')
        dot.setAttribute('r', '4.4')
        dot.setAttribute('fill', SVC_COLOR[pt.s])
        g.appendChild(dot)
      }
      const show = () => {
        tip.innerHTML =
          (pt.l ? `<img src="${clientLogo(pt.l)}" alt="">` : '') +
          `<b>${L(pt.n)}</b><span class="gv">${L(pt.g)}</span>` +
          `<span class="svc" style="background:${SVC_COLOR[pt.s]}">${svcLabel(pt.s)}</span>`
        const wr = wrap.getBoundingClientRect()
        const cr = g.getBoundingClientRect()
        tip.style.left = `${cr.left + cr.width / 2 - wr.left}px`
        tip.style.top = `${cr.top - wr.top}px`
        tip.classList.add('opacity-100')
      }
      g.addEventListener('mouseenter', show)
      g.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); show() })
      g.addEventListener('mouseleave', () => tip.classList.remove('opacity-100'))
      svg.appendChild(g)
    })

    wrap.appendChild(svg)
    applyView()

    /* ---- pan & zoom ---- */
    function clampView() {
      view.w = Math.max(W * 0.06, Math.min(W * 1.3, view.w))
      view.h = view.w * (HOME.h / HOME.w)
      view.x = Math.max(-W * 0.5, Math.min(W * 1.1 - view.w * 0.4, view.x))
      view.y = Math.max(-MAP.h * 0.5, Math.min(MAP.h * 1.1 - view.h * 0.4, view.y))
    }
    function zoomAt(px: number, py: number, f: number) {
      const r = wrap.getBoundingClientRect()
      const sx = view.x + ((px - r.left) / r.width) * view.w
      const sy = view.y + ((py - r.top) / r.height) * view.h
      view.w *= f
      clampView()
      view.x = sx - ((px - r.left) / r.width) * view.w
      view.y = sy - ((py - r.top) / r.height) * view.h
      clampView()
      applyView()
    }
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault()
      zoomAt(ev.clientX, ev.clientY, ev.deltaY > 0 ? 1.18 : 1 / 1.18)
    }
    const pointers: Record<number, PointerEvent> = {}
    let lastPan: { x: number; y: number } | null = null
    let lastDist: number | null = null
    const onDown = (ev: PointerEvent) => {
      pointers[ev.pointerId] = ev
      if (Object.keys(pointers).length === 1) {
        lastPan = { x: ev.clientX, y: ev.clientY }
        wrap.classList.add('cursor-grabbing')
      }
      wrap.setPointerCapture(ev.pointerId)
    }
    const onMove = (ev: PointerEvent) => {
      if (!pointers[ev.pointerId]) return
      pointers[ev.pointerId] = ev
      const ids = Object.keys(pointers)
      const r = wrap.getBoundingClientRect()
      if (ids.length === 1 && lastPan) {
        view.x -= ((ev.clientX - lastPan.x) / r.width) * view.w
        view.y -= ((ev.clientY - lastPan.y) / r.height) * view.h
        lastPan = { x: ev.clientX, y: ev.clientY }
        clampView()
        applyView()
      } else if (ids.length === 2) {
        const a = pointers[+ids[0]], b = pointers[+ids[1]]
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
        if (lastDist) zoomAt((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2, lastDist / d)
        lastDist = d
      }
    }
    const onUp = (ev: PointerEvent) => {
      delete pointers[ev.pointerId]
      if (Object.keys(pointers).length < 2) lastDist = null
      if (Object.keys(pointers).length === 0) {
        lastPan = null
        wrap.classList.remove('cursor-grabbing')
      }
    }
    wrap.addEventListener('wheel', onWheel, { passive: false })
    wrap.addEventListener('pointerdown', onDown)
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerup', onUp)
    wrap.addEventListener('pointercancel', onUp)

    const zin = () => { const r = wrap.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.45) }
    const zout = () => { const r = wrap.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.45) }
    const zhome = () => { Object.assign(view, HOME); applyView() }
    document.getElementById('mzIn')?.addEventListener('click', zin)
    document.getElementById('mzOut')?.addEventListener('click', zout)
    document.getElementById('mzHome')?.addEventListener('click', zhome)

    return () => {
      wrap.removeEventListener('wheel', onWheel)
      wrap.removeEventListener('pointerdown', onDown)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerup', onUp)
      wrap.removeEventListener('pointercancel', onUp)
      document.getElementById('mzIn')?.removeEventListener('click', zin)
      document.getElementById('mzOut')?.removeEventListener('click', zout)
      document.getElementById('mzHome')?.removeEventListener('click', zhome)
      svg.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const counts: Partial<Record<Service, number>> = {}
  for (const p of SHOWCASE.map.points) counts[p.s] = (counts[p.s] ?? 0) + 1
  const order: Service[] = ['csc', 'both', 'mad', 'water']

  return (
    <div
      ref={wrapRef}
      className="relative mt-6.5 rounded-card overflow-hidden bg-gradient-to-b from-[#f0f7ff] to-[#e7f1fb] border border-line-strong shadow-card h-[min(76vh,860px)] touch-none cursor-grab select-none"
    >
      {/* tooltip */}
      <div
        ref={tipRef}
        className="map-tip absolute z-10 pointer-events-none opacity-0 transition-opacity duration-150 bg-white text-ink border border-line-strong rounded-[14px] px-3.5 py-2.5 text-[.78rem] leading-6 shadow-[0_18px_44px_-12px_rgb(9_45_92/.4)] max-w-[250px] -translate-x-1/2 [transform:translate(-50%,calc(-100%-16px))] text-center
          [&_img]:h-[52px] [&_img]:max-w-[110px] [&_img]:object-contain [&_img]:block [&_img]:mx-auto [&_img]:mb-1.5
          [&_b]:text-[.86rem] [&_b]:block [&_b]:text-navy
          [&_.gv]:text-faint [&_.gv]:text-[.72rem]
          [&_.svc]:inline-block [&_.svc]:mt-1 [&_.svc]:px-3 [&_.svc]:py-0.5 [&_.svc]:rounded-full [&_.svc]:text-white [&_.svc]:text-[.7rem] [&_.svc]:font-semibold"
      />
      {/* legend */}
      <div className="absolute top-3.5 start-3.5 z-[5] flex flex-col gap-1.5">
        {order.map((s) =>
          counts[s] ? (
            <div
              key={s}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white/90 border border-line text-[.78rem] font-semibold text-navy backdrop-blur-sm shadow-[0_6px_18px_-8px_rgb(9_45_92/.25)]"
            >
              <span className="w-3 h-3 rounded-full flex-none" style={{ background: SVC_COLOR[s] }} />
              {svcLabel(s)}
              <span className="ms-auto ps-2.5 tabular-nums text-faint font-medium">{counts[s]}</span>
            </div>
          ) : null,
        )}
      </div>
      {/* zoom controls */}
      <div className="absolute bottom-4 end-4 z-[5] flex flex-col gap-2">
        {[
          ['mzIn', '+'],
          ['mzOut', '−'],
          ['mzHome', '⤢'],
        ].map(([id, ch]) => (
          <button
            key={id}
            id={id}
            aria-label={id}
            className="w-11 h-11 rounded-xl bg-white/95 border border-line-strong text-navy text-xl font-bold flex items-center justify-center shadow-[0_8px_20px_-8px_rgb(9_45_92/.3)] transition hover:bg-brand hover:border-brand hover:text-white"
          >
            {ch}
          </button>
        ))}
      </div>
      <div className="absolute bottom-4 start-3.5 z-[5] text-[.72rem] text-muted bg-white/85 border border-line px-3 py-1.5 rounded-full backdrop-blur-sm">
        {t('mapHint')}
      </div>
    </div>
  )
}
