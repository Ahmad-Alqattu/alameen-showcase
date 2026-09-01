import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import { ChevronRight, ChevronLeft, Pause, Play, Maximize2, Minimize2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ShowcaseStage from './ShowcaseStage';
import { useBilingual } from './bilingual';
import {
  activeSlides,
  SHOWCASE_SECTIONS,
  SLIDE_ACCENTS,
  SLIDE_DURATION_MS,
  PRODUCT_SLIDE_DURATION_MS,
  POINT_BUILD_SHARE,
  QR_TARGET,
} from './slides';
import { asset } from './assetUrl';

/**
 * The company profile deck — Al-Ameen Technologies presenting itself.
 *
 * Who we are, where we run, the AI that runs through everything we build, the ten products, the
 * record, and the way in. It runs itself on a timer for a lobby screen or an exhibition stand, and
 * a presenter can take it over at any point.
 *
 * The look is deliberately plain: a light ground, one accent, hairlines instead of borders, and no
 * glow anywhere. Two reasons. Every screenshot in the deck is of a light interface, and a dark
 * panel made those look like renderings rather than software; and a government client reads a
 * restrained document as a company that has done this before.
 *
 * It reads no module data — every word comes from the locale files — so it is safe on a screen in a
 * public room, and safe to show one client without showing another client's figures.
 *
 * Deliberately outside ModuleShell: a deck with a sidebar and a breadcrumb over it is not a deck.
 */
export default function ShowcaseApp() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAr = i18n.language === 'ar';
  const bi = useBilingual();
  // Read once: the cut is a property of how the page was opened, not of any state.
  const slides = useMemo(() => activeSlides(), []);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1 through the current slide
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  // Points a paused presenter has stepped in by hand, on top of whatever the clock revealed.
  const [steppedPoints, setSteppedPoints] = useState(0);

  const slide = slides[index];
  const accent = SLIDE_ACCENTS[slide.accent];
  // A slide showing real screens has more to show, so it is given more time to show it.
  const showsScreens = Boolean(slide.product || slide.shots);
  const duration = showsScreens ? PRODUCT_SLIDE_DURATION_MS : SLIDE_DURATION_MS;

  const go = useCallback((delta: number) => {
    setIndex((current) => (current + delta + slides.length) % slides.length);
    setProgress(0);
    setSteppedPoints(0);
  }, []);

  const jumpTo = useCallback((next: number) => {
    setIndex(next);
    setProgress(0);
    setSteppedPoints(0);
  }, []);

  // ── The clock ───────────────────────────────────────────────────────────────
  // A frame loop rather than an interval: the progress bar and the point build both read from it,
  // and at 100ms steps both visibly stutter.
  const startedAt = useRef(0);
  useEffect(() => {
    if (!playing) return;
    startedAt.current = performance.now() - progress * duration;
    let frame = 0;
    const tick = (now: number) => {
      const ratio = (now - startedAt.current) / duration;
      if (ratio >= 1) {
        go(1);
        return;
      }
      setProgress(ratio);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // `progress` is read once to resume where a pause left off, never to re-arm the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index, go, duration]);

  // ── The build ───────────────────────────────────────────────────────────────
  // Points appear one at a time over the first stretch of the slide, so the deck reads as narration
  // rather than a wall of text that lands at once. A presenter who pauses can step the rest in by
  // hand — that is what ArrowDown is for.
  const revealed = useMemo(() => {
    const step = POINT_BUILD_SHARE / slide.points;
    const timed = Math.min(slide.points, Math.floor(progress / step) + 1);
    return Math.min(slide.points, Math.max(timed, steppedPoints));
  }, [progress, slide.points, steppedPoints]);

  useEffect(() => {
    QRCode.toDataURL(QR_TARGET, { margin: 0, width: 320, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch(() => setQr(null));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // A browser that refuses fullscreen (or a policy that blocks it) still leaves a usable deck.
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // In Arabic the deck runs right-to-left, so the arrow that means "onward" flips with it.
      const forward = isAr ? 'ArrowLeft' : 'ArrowRight';
      const back = isAr ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === forward) { go(1); }
      else if (e.key === back) { go(-1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSteppedPoints((n) => n + 1); }
      else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key.toLowerCase() === 'f') { void toggleFullscreen(); }
      else if (e.key === 'Escape' && !document.fullscreenElement) { navigate('/dashboard'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, isAr, navigate, toggleFullscreen]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const points = useMemo(
    () => Array.from({ length: slide.points }, (_, i) => bi(`showcase.slides.${slide.id}.b${i + 1}`)),
    [slide, bi],
  );

  // A few slides correspond to a section of THIS platform. Offer it only to someone whose account
  // actually carries the module — an invitation to a screen that answers "access denied" is worse
  // than no invitation.
  const canOpenSection =
    Boolean(slide.route) &&
    (!slide.moduleCode || Boolean(user?.isSuperAdmin || user?.modules.includes(slide.moduleCode)));

  return (
    <div
      className="showcase-root fixed inset-0 z-40 flex flex-col lg:flex-row bg-[#f7f8fa] text-slate-900 overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{ ['--accent' as string]: accent }}
    >
      {/* One hairline of progress across the very top, the way a deck marks its own place. */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-slate-200/70 z-10">
        <div className="h-full transition-none" style={{ width: `${progress * 100}%`, background: accent }} />
      </div>

      <main className="relative flex-1 min-w-0 flex flex-col px-6 sm:px-8 lg:px-10 pt-6 pb-4 gap-4">
        {/* ── Title ── re-keyed per slide so the entrance replays. */}
        <header key={`head-${slide.id}`} className="showcase-enter shrink-0 pt-4 sm:pt-7 text-center">
          <p className="inline-flex items-center gap-2.5 text-sm sm:text-base font-bold tracking-[.08em] uppercase" style={{ color: accent }}>
            <slide.Icon className="w-5 h-5" strokeWidth={2.2} />
            {bi(`showcase.slides.${slide.id}.eyebrow`).ar}
            {bi(`showcase.slides.${slide.id}.eyebrow`).en !== bi(`showcase.slides.${slide.id}.eyebrow`).ar && (
              <>
                <span className="opacity-40">·</span>
                {bi(`showcase.slides.${slide.id}.eyebrow`).en}
              </>
            )}
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
            {bi(`showcase.slides.${slide.id}.title`).ar}
          </h1>
          <p dir="ltr" className="mt-2 text-xl sm:text-2xl xl:text-3xl font-bold tracking-tight text-slate-500">
            {bi(`showcase.slides.${slide.id}.title`).en}
          </p>
          <p className="mt-3 text-base sm:text-lg text-slate-500 leading-relaxed max-w-5xl mx-auto">
            {bi(`showcase.slides.${slide.id}.tagline`).ar}
            <span dir="ltr" className="block mt-1 text-sm sm:text-base text-slate-400">
              {bi(`showcase.slides.${slide.id}.tagline`).en}
            </span>
          </p>
        </header>

        {/* ── Stage + points ──
            A centred row rather than a column template. A screenshot is sized to ITSELF — a phone
            capture is a tall sliver, a dashboard a wide band — and any fixed fraction left the
            cards the same distance away either way: a hand's width from the dashboard, half a
            screen from the phone. Here the picture takes exactly the width it paints, the cards
            take theirs, and the gap between them is the gap, whatever is on screen.

            The map and the logo walls have no width of their own — they fill what they are given —
            so those still stretch. */}
        <div className="flex-1 min-h-0 flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-10">
<div
            key={`stage-${slide.id}`}
            className={`showcase-enter w-full h-full min-h-[14rem] min-w-0 flex items-center justify-center ${
              showsScreens ? 'xl:w-auto xl:flex-none' : 'xl:flex-1'
            }`}
          >
            <ShowcaseStage slide={slide} onInteract={() => setPlaying(false)} />
          </div>

          {/* Not a bullet list. These are separate claims, not steps in a sequence, and numbering
              them implied an order the content does not have. Each is its own card with the
              slide's colour on its leading edge — they stack, arrive one at a time, and read as
              facts rather than as minutes of a meeting. */}
          <div hidden={slide.points === 0} className="w-full xl:w-auto xl:min-w-[19rem] xl:max-w-[30rem] flex flex-col justify-center gap-2.5 min-w-0">
            {points.map((text, i) => (
              <div
                key={`${slide.id}-${i}`}
                // A point that has not arrived is `hidden` rather than absent, so the stack keeps
                // its place and the cards already up do not jump when the next lands.
                hidden={i >= revealed}
                className="showcase-point relative overflow-hidden rounded-xl bg-white ring-1 ring-slate-900/8 shadow-[0_1px_2px_rgb(15_23_42/.04)] ps-5 pe-4 py-3.5"
              >
                <span className="absolute inset-y-0 start-0 w-1.5" style={{ background: accent }} />
                <p className="text-base sm:text-lg font-semibold leading-[1.55] text-slate-800">{text.ar}</p>
                <p dir="ltr" className="mt-1 text-xs sm:text-sm leading-snug text-slate-400 text-end">{text.en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Controls ── */}
        <footer className="shrink-0 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1">
            <ControlButton label={t('showcase.previous')} onClick={() => go(-1)}>
              {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </ControlButton>
            <ControlButton
              label={playing ? t('showcase.pause') : t('showcase.play')}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </ControlButton>
            <ControlButton label={t('showcase.next')} onClick={() => go(1)}>
              {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </ControlButton>
          </div>

          {/* ── Chapters, not twenty-six equal dots ──
              Grouped by section and labelled, so "go back to the AI part" is one click on the AI
              band. Each band is as wide as the chapter is long, and its own slides sit inside it. */}
          <nav className="flex-1 flex items-end gap-3 sm:gap-5 min-w-0" aria-label={t('showcase.sections')}>
            {SHOWCASE_SECTIONS.map((section) => {
              const first = slides.findIndex((s) => s.section === section);
              const inSection = slides.filter((s) => s.section === section);
              const active = slide.section === section;
              return (
                <div
                  key={section}
                  className="flex flex-col gap-1.5 min-w-0"
                  style={{ flex: `${inSection.length} 1 0%` }}
                >
                  <button
                    type="button"
                    onClick={() => jumpTo(first)}
                    className={`truncate text-start text-[10px] sm:text-[11px] font-bold tracking-wide transition-colors ${active ? '' : 'text-slate-400 hover:text-slate-600'}`}
                    style={active ? { color: accent } : undefined}
                  >
                    {bi(`showcase.sections.${section}`).ar}
                  </button>
                  <div className="flex items-center gap-1">
                    {inSection.map((s) => {
                      const i = slides.indexOf(s);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => jumpTo(i)}
                          aria-label={t(`showcase.slides.${s.id}.title`)}
                          aria-current={i === index ? 'true' : undefined}
                          className="group relative flex-1 h-1 rounded-full bg-slate-200 overflow-hidden transition-[height] hover:h-2.5 focus-visible:h-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <span
                            className="absolute inset-y-0 start-0 rounded-full"
                            style={{
                              width: i <= index ? '100%' : '0%',
                              background: i === index ? accent : 'rgb(148 163 184 / .85)',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* A fraction reads the same way in both languages; left to inherit RTL it came out
              reversed as "20 / 3". */}
          <span dir="ltr" className="shrink-0 text-xs sm:text-sm tabular-nums text-slate-400 font-bold">
            {index + 1} / {slides.length}
          </span>

          <div className="flex items-center gap-1">
            <ControlButton
              label={isFullscreen ? t('showcase.exitFullscreen') : t('showcase.fullscreen')}
              onClick={() => void toggleFullscreen()}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </ControlButton>
            <ControlButton label={t('showcase.exit')} onClick={() => navigate('/dashboard')}>
              <X className="w-5 h-5" />
            </ControlButton>
          </div>
        </footer>
      </main>

      {/* ── Side rail ──
          A tenth of the width: the mark, the caption for what is on screen, and at the foot the code
          that puts the company in the visitor's hand. On a phone it becomes a strip along the bottom
          instead — 10% of a narrow screen is not a column, it is a margin. */}
      <aside className="shrink-0 w-full lg:w-[13%] lg:min-w-[16.5rem] border-t lg:border-t-0 border-s-0 lg:border-s border-slate-200 bg-white flex lg:flex-col items-center gap-4 p-4 lg:px-3.5 lg:py-7">
        <img src={asset("logo-alameen.png")} alt="" className="hidden lg:block w-full h-auto" />

        <div key={`caption-${slide.id}`} className="showcase-enter flex-1 lg:flex-none min-w-0 lg:w-full lg:text-center">
          <p className="text-[10px] font-black tracking-[.1em] uppercase" style={{ color: accent }}>
            {t('showcase.nowShowing')}
          </p>
          <p className="mt-1.5 text-sm font-bold leading-snug text-slate-800">
            {bi(`showcase.slides.${slide.id}.title`).ar}
          </p>
          <p dir="ltr" className="mt-0.5 text-[11px] font-semibold leading-snug text-slate-400">
            {bi(`showcase.slides.${slide.id}.title`).en}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            {bi(`showcase.slides.${slide.id}.caption`).ar}
          </p>
          {canOpenSection && (
            <button
              type="button"
              onClick={() => navigate(slide.route!)}
              className="mt-3 w-full text-[11px] font-bold rounded-lg border border-slate-200 px-2 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {t('showcase.openSection')}
            </button>
          )}
        </div>

        <div className="shrink-0 lg:mt-auto w-full max-w-[7rem] lg:max-w-[8rem] lg:mx-auto text-center">
          <div className="rounded-lg ring-1 ring-slate-200 p-2 bg-white">
            {qr
              ? <img src={qr} alt={t('showcase.qrAlt')} className="w-full h-auto" />
              : <div className="aspect-square w-full animate-pulse rounded bg-slate-100" />}
          </div>
          {/* The name under the code, because a photographed QR loses whose it was. */}
          <p className="mt-2.5 text-xs font-bold leading-tight text-slate-700">{t('showcase.companyName')}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-slate-400">{t('showcase.companyWeb')}</p>
        </div>
      </aside>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid place-items-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors"
    >
      {children}
    </button>
  );
}
