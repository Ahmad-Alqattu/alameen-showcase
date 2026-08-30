import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from './i18n'
import { SHOWCASE } from './data'
import type { Bi } from './types'

/**
 * Booth mode.
 *
 * A 55" panel and a phone both report `pointer: coarse` and `hover: none`, and
 * no media query separates them (CSSWG #13398 is unresolved). We own the booth
 * URL, so we declare it instead of sniffing: `?mode=kiosk` stamps
 * `data-mode="kiosk"` on <html>, which a token override in index.css keys off.
 *
 * Idle is 100s, not the usual 30-60s: a booth screen must not reset itself
 * while the visitor is mid-sentence with the person staffing the stand.
 */

const IDLE_MS = 100_000
const PROMPT_MS = 12_000
const SCENE_MS = 7_000

interface Kiosk {
  on: boolean
  attract: boolean
  /** Leave the attract screen. The gesture that calls this also buys us
   *  fullscreen and audio unlock, which no flag can grant on load. */
  begin: () => void
}
const Ctx = createContext<Kiosk>({ on: false, attract: false, begin: () => {} })
export const useKiosk = () => useContext(Ctx)

/**
 * Reads the mode AND stamps the root synchronously. React runs child effects
 * before the parent's, so stamping in an effect left CoverageMap measuring the
 * previous mode and drawing 13px governorate labels on a booth panel.
 */
function readMode(): boolean {
  const p = new URLSearchParams(window.location.search).get('mode')
  let on: boolean
  if (p === 'kiosk') { try { localStorage.setItem('kioskMode', '1') } catch {} ; on = true }
  else if (p === 'web') { try { localStorage.removeItem('kioskMode') } catch {} ; on = false }
  else { try { on = localStorage.getItem('kioskMode') === '1' } catch { on = false } }
  document.documentElement.setAttribute('data-mode', on ? 'kiosk' : 'web')
  return on
}

/** Keeps the panel awake. The lock dies whenever the page hides and does not
 *  return on its own, so re-acquire on visibilitychange (MDN's pattern). */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen')
      } catch { /* denied or not permitted — OS settings are the real defence */ }
    }
    const onVisible = () => {
      if (!cancelled && document.visibilityState === 'visible') acquire()
    }
    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [active])
}

export function KioskProvider({ children }: { children: ReactNode }) {
  const [on] = useState(readMode)
  const [attract, setAttract] = useState(on)
  const { lang, toggle } = useI18n()
  const langRef = useRef(lang)
  langRef.current = lang

  useWakeLock(on)

  /**
   * A reset must destroy the session, not merely navigate. The one that bites
   * bilingual booths: a visitor flips to English, walks off, and the next Arab
   * official arrives at an LTR screen.
   */
  const reset = useCallback(() => {
    if (langRef.current !== 'ar') toggle()
    window.location.hash = '#/'
    window.scrollTo(0, 0)
    setAttract(true)
  }, [toggle])

  const begin = useCallback(() => {
    setAttract(false)
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    }
  }, [])

  /* Idle watch. `mousemove` is deliberately excluded: a stray USB mouse or a
     jittery touch controller emits it forever and the booth never returns. */
  useEffect(() => {
    if (!on || attract) return
    let t: number
    const arm = () => {
      clearTimeout(t)
      t = window.setTimeout(reset, IDLE_MS + PROMPT_MS)
    }
    const evs = ['pointerdown', 'touchstart', 'keydown', 'wheel'] as const
    evs.forEach((e) => document.addEventListener(e, arm, { passive: true }))
    arm()
    return () => {
      clearTimeout(t)
      evs.forEach((e) => document.removeEventListener(e, arm))
    }
  }, [on, attract, reset])

  return (
    <Ctx.Provider value={{ on, attract, begin }}>
      {children}
      {on && attract && <AttractScreen onBegin={begin} />}
    </Ctx.Provider>
  )
}

/* ------------------------------------------------------------------ */

/**
 * The attract loop. Müller et al. (CHI 2012) found no attract loop beat one
 * carrying a call to action, and Kukka et al. (CHI 2013, 1,863 first touches)
 * found coloured animated *text* pulls 2.2x the touches of an icon — so the
 * invitation is a word, not a glyph, and it is the only thing that moves.
 *
 * Scenes are set in the attract register (read at 3-5m, walking past); the
 * page behind them is the engaged register (read at arm's length).
 */
function AttractScreen({ onBegin }: { onBegin: () => void }) {
  const { L } = useI18n()
  const [scene, setScene] = useState(0)

  const nClients = SHOWCASE.clients.reduce((a, c) => a + c.items.length, 0)
  const nMunis = SHOWCASE.clients.find((c) => c.key === 'mun')?.items.length ?? 0
  const nShots = SHOWCASE.products.reduce((a, p) => a + p.imgs.length, 0)

  const SCENES: { eyebrow: Bi; line: Bi; sub: Bi }[] = [
    {
      eyebrow: ['الأمين للتقنيات', 'Al-Ameen Technologies'],
      line: ['حلولٌ رقمية تُدار بها مدنٌ ومؤسسات', 'Digital solutions that run cities & institutions'],
      sub: ['منذ 2008 · فلسطين والشرق الأوسط', 'Since 2008 · Palestine & the Middle East'],
    },
    {
      eyebrow: ['المساعد الذكي · سَبْر', 'Sabr · the assistant'],
      line: ['اسأل بالعربية، يجيبك من بياناتك', 'Ask in Arabic, get an answer from your data'],
      sub: [
        'يقرأ بصلاحياتك أنت، لا بصلاحياته',
        'It reads with your permissions, not its own',
      ],
    },
    {
      eyebrow: ['أنظمة تعمل فعلياً', 'Systems actually in production'],
      line: [`${nClients} جهة · ${nMunis} بلدية · ${nShots} شاشة حيّة`, `${nClients} organizations · ${nMunis} municipalities · ${nShots} live screens`],
      sub: ['لا نماذج تجريبية — أنظمة في الخدمة', 'Not mock-ups — systems in service'],
    },
  ]

  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), SCENE_MS)
    return () => clearInterval(id)
  }, [SCENES.length])

  const s = SCENES[scene]
  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={onBegin}
      onKeyDown={onBegin}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center text-center cursor-pointer select-none
        bg-gradient-to-br from-[#02182e] via-navy to-[#062c52] text-white px-[8vw] py-[6vh]"
    >
      {/* AAA contrast: a convention hall is far brighter than an office, and
          a dark ground on an emissive panel is what survives it. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-80
          [background:radial-gradient(900px_540px_at_78%_-10%,rgb(0_167_225/.3),transparent_62%),radial-gradient(700px_460px_at_-6%_105%,rgb(0_120_233/.26),transparent_60%)]"
      />
      <img
        src="./assets/logo-alameen-white.png"
        alt="Al-Ameen Technologies"
        className="relative h-[clamp(64px,8vh,120px)] mb-[6vh]"
      />
      <div key={scene} className="relative animate-rise">
        <div className="font-mono text-[clamp(1rem,1.6vw,1.6rem)] tracking-[.18em] uppercase text-cyan mb-[3vh]">
          {L(s.eyebrow)}
        </div>
        <h1 className="font-bold leading-[1.3] text-[clamp(2.4rem,6.2vw,7rem)] max-w-[18ch] mx-auto text-balance">
          {L(s.line)}
        </h1>
        <p className="mt-[3vh] text-[clamp(1.1rem,2vw,2.1rem)] font-light text-[#bcd8f2] leading-relaxed">
          {L(s.sub)}
        </p>
      </div>

      {/* The invitation: text, coloured, and the only moving thing on screen. */}
      <div className="relative mt-[7vh] flex flex-col items-center gap-[2.5vh]">
        <span className="font-bold text-cyan text-[clamp(1.4rem,2.6vw,2.6rem)] animate-[attract_1.9s_ease-in-out_infinite]">
          {L(['المس الشاشة للبدء', 'Touch the screen to begin'])}
        </span>
        <div className="flex gap-2.5">
          {SCENES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === scene ? 'w-10 bg-cyan' : 'w-4 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
