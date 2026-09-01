import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SLIDE_ACCENTS, PRODUCT_PICKS, CHIP_ICONS, type ShowcaseSlide } from './slides';
import CoverageMap from './CoverageMap';
import {
  CLIENT_LOGOS,
  HEADLINE_CLIENT_LOGOS,
  PARTNER_LOGOS,
  PRODUCT_SHOTS,
  type ProductShot,
} from './mapData';
import { asset } from './assetUrl';
import { useBilingual } from './bilingual';

/** How long one real screen holds before the next crossfades in. */
const SCREEN_HOLD_MS = 3400;

/**
 * The picture on each slide.
 *
 * Real screens first: if the slide names a product or a set of shots, actual screenshots fill the
 * stage and nothing is drawn. Marks come second — the client and partner walls are the companies'
 * own logos. Only where neither exists does an abstract shape stand in, and there are few of those
 * left.
 *
 * The ground is light on purpose. Every screenshot here is of a light interface; floating those on
 * a dark, glowing panel made them look like renderings of software rather than software.
 */
export default function ShowcaseStage({ slide, onInteract }: { slide: ShowcaseSlide; onInteract?: () => void }) {
  const accent = SLIDE_ACCENTS[slide.accent];
  const shots = resolveShots(slide);

  return (
    <div
      // The coverage map is operable, so the stage is only hidden from assistive tech when what
      // it holds is decoration.
      aria-hidden={slide.visual === 'coverage' || shots.length > 0 ? undefined : true}
      // Screens hug their own width so the cards can sit right beside them; everything else fills
      // what it is given, because a map or a logo wall has no width of its own.
      className={`showcase-stage relative h-full min-h-0 flex items-center justify-center ${
        shots.length > 0 ? 'w-fit max-w-full' : 'w-full'
      }`}
      style={{ ['--accent' as string]: accent }}
    >
      {shots.length > 0 ? (
        <ScreensVisual shots={shots} onInteract={onInteract} />
      ) : (
        <>
          {!slide.logoOnly && slide.visual === 'funders' && <FundersVisual />}
          {!slide.logoOnly && slide.visual === 'ecosystem' && slide.ecosystem && <EcosystemVisual items={slide.ecosystem} />}
          {!slide.logoOnly && slide.visual === 'hub' && <HubVisual />}
          {!slide.logoOnly && slide.visual === 'chips' && slide.chips && <ChipsVisual items={slide.chips} />}
          {!slide.logoOnly && slide.visual === 'logogrid' && <LogoGridVisual logos={HEADLINE_CLIENT_LOGOS} />}
          {!slide.logoOnly && slide.visual === 'partnerwall' && <LogoGridVisual logos={PARTNER_LOGOS} large />}
          {!slide.logoOnly && slide.visual === 'logowall' && <LogoWallVisual />}
          {!slide.logoOnly && slide.visual === 'coverage' && <CoverageMap onInteract={onInteract} />}
          {slide.logoOnly && slide.product && <ProductMarkVisual slug={slide.product} />}
          {slide.visual === 'mark' && !slide.logoOnly && <MarkVisual />}
          {!slide.logoOnly && slide.visual === 'aiflow' && <AiFlowVisual />}
        </>
      )}
    </div>
  );
}

/** Slides name their screens either as a whole product or as an explicit cross-product set. */
function resolveShots(slide: ShowcaseSlide): { slug: string; shot: ProductShot }[] {
  if (slide.logoOnly) return [];
  if (slide.product) {
    const all = PRODUCT_SHOTS[slide.product] ?? [];
    const picked = PRODUCT_PICKS[slide.product];
    // The curated walk-through where there is one; the whole folder only as a fallback, so a
    // product added later still shows something rather than nothing.
    const files = picked ?? all.slice(0, 6).map((s) => s.f);
    return files.flatMap((f) => {
      const shot = all.find((x) => x.f === f);
      return shot ? [{ slug: slide.product!, shot }] : [];
    });
  }
  if (slide.shots) {
    return slide.shots.flatMap((ref) => {
      const [slug, file] = ref.split('/');
      const shot = (PRODUCT_SHOTS[slug] ?? []).find((x) => x.f === file);
      return shot ? [{ slug, shot }] : [];
    });
  }
  return [];
}

/**
 * The real screens — and they are operable, not a slideshow you watch go past.
 *
 * They advance on their own so an unattended loop still moves, but a pointer over them holds the
 * current one (someone reading a screen should not have it taken away), clicking anywhere on the
 * image steps forward, and the dots jump straight to a screen. Each carries the caption the company
 * wrote for it.
 */
function ScreensVisual({ shots, onInteract }: { shots: { slug: string; shot: ProductShot }[]; onInteract?: () => void }) {
  const { t, i18n } = useTranslation();
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);

  /**
   * The figure is made exactly as wide as the picture actually paints.
   *
   * CSS cannot do this. `w-fit` sizes from intrinsic contributions, and a replaced element's
   * intrinsic width is the FILE's width — 720px for a phone capture that paints 329 because its
   * height is what binds. So the figure reserved four hundred pixels it never drew on, and the
   * cards beside it sat that far away. Measuring the painted box is the only thing that knows.
   *
   * No feedback loop: the image's used width follows from its height and the viewport cap, neither
   * of which depends on the width we set here.
   */
  const imgRef = useRef<HTMLImageElement>(null);
  const [paintedWidth, setPaintedWidth] = useState<number>();
  useLayoutEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const measure = () => setPaintedWidth(el.getBoundingClientRect().width || undefined);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [at]);

  // No reset here: the deck re-keys the stage per slide, so this remounts at 0 on its own.
  useEffect(() => {
    if (shots.length < 2 || held) return;
    const id = setInterval(() => setAt((n) => (n + 1) % shots.length), SCREEN_HOLD_MS);
    return () => clearInterval(id);
  }, [shots.length, held]);

  const step = (delta: number) => {
    onInteract?.();
    setAt((n) => (n + delta + shots.length) % shots.length);
  };

  const { slug, shot } = shots[at];
  const caption = shot.cap?.[i18n.language === 'ar' ? 0 : 1];

  return (
    <figure
      style={{ width: paintedWidth }}
      className="h-full max-w-full flex flex-col items-center justify-center gap-2.5 min-h-0"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
    >
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={t('showcase.nextScreen')}
        className="flex-1 min-h-0 w-full flex items-center justify-center group cursor-pointer"
      >
        <img
          key={`${slug}/${shot.f}`}
          ref={imgRef}
          onLoad={() => setPaintedWidth(imgRef.current?.getBoundingClientRect().width || undefined)}
          src={asset(slug === 'live' ? `live/${shot.f}` : `showcase/products/${slug}/${shot.f}`)}
          alt=""
          // `h-full w-auto` and not `max-h-full`: with a max-height the box keeps the file's intrinsic
          // width while the picture inside shrinks to fit the height, so a tall phone capture
          // reserved several hundred pixels it never painted and pushed the cards away from it.
          className="showcase-screen h-full w-auto max-w-[62vw] object-contain rounded-lg ring-1 ring-slate-900/10 group-hover:ring-slate-900/25 shadow-[0_24px_60px_-24px_rgb(15_23_42/.45)] bg-white transition-shadow"
        />
      </button>

      {caption && (
        <figcaption
          key={`${shot.f}-cap`}
          className="showcase-enter shrink-0 w-full text-center text-base sm:text-lg font-bold text-slate-700"
        >
          {caption}
        </figcaption>
      )}

      {shots.length > 1 && (
        <div className="shrink-0 flex items-center gap-2">
          {shots.map((sh, i) => (
            <button
              key={`${sh.slug}/${sh.shot.f}`}
              type="button"
              onClick={() => { onInteract?.(); setAt(i); }}
              aria-label={sh.shot.cap?.[i18n.language === 'ar' ? 0 : 1] ?? String(i + 1)}
              aria-current={i === at ? 'true' : undefined}
              className="h-2.5 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-full"
            >
              <span
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === at ? '1.5rem' : '.5rem',
                  background: i === at ? 'var(--accent)' : 'rgb(148 163 184 / .55)',
                }}
              />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}

/** A grid of marks, arriving one after another. Used where the names ARE the argument. */
function LogoGridVisual({ logos, large = false }: { logos: string[]; large?: boolean }) {
  // Rows share the stage's height rather than stacking past it: one mark spilling under the
  // controls is worse than showing five fewer.
  // Four rows of six. At five rows the tiles were shorter than their own padding and the marks
  // spilled over each other; six fewer logos is a cheap price for a grid that fits.
  const shown = large ? logos : logos.slice(0, 24);
  return (
    <div
      className={`grid gap-3 sm:gap-4 w-full h-full auto-rows-fr content-center ${large ? 'grid-cols-2 sm:grid-cols-3 max-w-2xl' : 'grid-cols-4 sm:grid-cols-6'}`}
    >
      {shown.map((file, i) => (
        <span
          key={file}
          className={`showcase-pop grid place-items-center rounded-xl bg-white ring-1 ring-slate-900/8 min-h-0 overflow-hidden ${large ? 'p-6' : 'p-2.5'}`}
          style={{ animationDelay: `${i * 55}ms` }}
        >
          <img src={asset(`showcase/clients/${file}`)} alt="" loading="lazy" className="max-w-full max-h-full object-contain" />
        </span>
      ))}
    </div>
  );
}

/**
 * The full client register.
 *
 * Eighty marks are too many to arrange and too few to abstract, so they travel: three rows drifting
 * in alternate directions, each strip duplicated so the loop has no seam. Pinned to `ltr` because a
 * strip of logos has no reading direction, and inheriting RTL sent the translate the wrong way.
 */
function LogoWallVisual() {
  const per = Math.ceil(CLIENT_LOGOS.length / 3);
  const rows = [CLIENT_LOGOS.slice(0, per), CLIENT_LOGOS.slice(per, per * 2), CLIENT_LOGOS.slice(per * 2)];

  return (
    <div className="w-full flex flex-col gap-4 overflow-hidden">
      {rows.map((row, r) => (
        <div key={r} dir="ltr" className="relative overflow-hidden">
          <div
            className="showcase-marquee flex items-center gap-4 w-max"
            style={{ animationDirection: r === 1 ? 'reverse' : 'normal', animationDuration: `${42 + r * 7}s` }}
          >
            {[...row, ...row].map((file, i) => (
              <span
                key={`${file}-${i}`}
                className="shrink-0 grid place-items-center w-32 h-24 sm:w-36 sm:h-28 rounded-xl bg-white ring-1 ring-slate-900/8 p-4"
              >
                <img src={asset(`showcase/clients/${file}`)} alt="" loading="lazy" className="max-w-full max-h-full object-contain" />
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The company mark — the closing card, where a screenshot would be beside the point. */
function MarkVisual() {
  return (
    <div className="flex flex-col items-center gap-10">
      <img src={asset("logo-alameen.png")} alt="" className="showcase-pop w-80 sm:w-[28rem] h-auto" />
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="showcase-pop h-1 rounded-full"
            style={{
              width: i === 2 ? '3.5rem' : '1.25rem',
              animationDelay: `${400 + i * 110}ms`,
              background: i === 2 ? 'var(--accent)' : 'rgb(148 163 184 / .45)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The path a question takes — the one diagram that has to be exactly right.
 *
 * Four hops with the gate in the middle, because the claim on that slide is a claim about WHERE the
 * permission check sits: between the assistant and the engine, not after it. The last box is the
 * reporting engine, never "the database" — labelling it that would draw the arrow the slide denies.
 */
function AiFlowVisual() {
  const { t } = useTranslation();
  const hops = ['q', 'a', 'gate', 'db'];
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-2">
      {hops.map((k, i) => (
        <div key={k} className="w-full flex flex-col items-center gap-2">
          <div
            className="showcase-pop w-full rounded-xl px-5 py-4 text-center"
            style={{
              animationDelay: `${i * 240}ms`,
              background: k === 'gate' ? 'var(--accent)' : '#fff',
              boxShadow: k === 'gate' ? 'none' : 'inset 0 0 0 1px rgb(15 23 42 / .1)',
            }}
          >
            <span className={`text-sm sm:text-base font-bold ${k === 'gate' ? 'text-white' : 'text-slate-700'}`}>
              {t(`showcase.flow.${k}`)}
            </span>
          </div>
          {i < hops.length - 1 && (
            <div className="relative h-7 w-px bg-slate-300 overflow-hidden">
              <span
                className="showcase-descend absolute inset-x-0 h-3"
                style={{ background: 'var(--accent)', animationDelay: `${i * 380}ms` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * A product shown by its mark rather than by a screen.
 *
 * For the older systems, whose captures are all dense forms from another decade. The mark
 * is set on the same white card the screenshots sit on, so the slide keeps its rhythm and
 * a viewer reads a deliberate choice rather than a missing asset.
 */
function ProductMarkVisual({ slug }: { slug: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="grid place-items-center w-full max-w-md aspect-[4/3] rounded-2xl bg-white ring-1 ring-slate-900/8 shadow-[0_24px_60px_-30px_rgb(15_23_42/.35)] p-12">
        <img
          src={asset(`showcase/products/${slug}/logo.png`)}
          alt=""
          className="showcase-pop max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}

/**
 * A list whose items are the picture.
 *
 * Specializations and a technology stack have no screenshot: nothing to capture says
 * ".NET 10". Set as tiles they are legible across a room, which a paragraph naming the
 * same things is not.
 */
function ChipsVisual({ items }: { items: NonNullable<ShowcaseSlide['chips']> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full h-full auto-rows-fr content-center max-w-xl">
      {items.map(({ label, icon }, i) => {
        const Icon = CHIP_ICONS[icon];
        const latin = !/[\u0600-\u06FF]/.test(label);
        return (
          <span
            key={label}
            className="showcase-pop flex items-center gap-3 rounded-xl bg-white ring-1 ring-slate-900/8 px-4 py-3 min-h-0"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <Icon className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={2} />
            {/* A Latin technical name is LTR text in an RTL page: left to inherit the page
                direction, the bidi pass moves the leading dot of ".NET 10" to the end. */}
            <span dir={latin ? 'ltr' : undefined} className="text-sm sm:text-base font-bold text-slate-700 leading-tight">
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** The bodies that funded and received the flagship projects, by their own marks. */
const FUNDERS = ['world-bank.png', 'usaid.png', 'giz.png', 'global-communities.png',
                 'tetra-tech.png', 'btc.png', 'land-auth.png', 'ptax-dir.png', 'moe.png'];

function FundersVisual() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full h-full auto-rows-fr content-center max-w-xl">
      {FUNDERS.map((file, i) => (
        <span
          key={file}
          className="showcase-pop grid place-items-center rounded-xl bg-white ring-1 ring-slate-900/8 min-h-0 overflow-hidden p-3"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <img src={asset(`showcase/clients/${file}`)} alt="" loading="lazy"
               className="max-w-full max-h-full object-contain" />
        </span>
      ))}
    </div>
  );
}

/**
 * The platform seen whole.
 *
 * Nine capabilities on one board, arriving together, before any single one is opened. A
 * feature list read down a column is nine claims; the same nine as a board is one system,
 * which is the thing being sold. Each tile carries only its name — the slides that follow
 * are where a capability earns its sentence.
 */
function EcosystemVisual({ items }: { items: { key: string; icon: keyof typeof CHIP_ICONS }[] }) {
  const bi = useBilingual();
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full h-full auto-rows-fr content-center max-w-2xl">
      {items.map(({ key, icon }, i) => {
        const Icon = CHIP_ICONS[icon];
        return (
          <div
            key={key}
            className="showcase-pop flex flex-col items-center justify-center gap-2.5 text-center rounded-2xl bg-white ring-1 ring-slate-900/8 px-4 py-5 min-h-0"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <Icon className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={1.6} />
            <span dir="ltr" className="text-sm sm:text-base font-black leading-tight text-slate-800">
              {bi(`showcase.ecosystem.${key}`).en}
            </span>
            <span className="text-xs sm:text-sm leading-tight text-slate-500">
              {bi(`showcase.ecosystem.${key}`).ar}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The claim, drawn instead of asserted.
 *
 * "Connected services" shown as six separate cards contradicted itself — the eye saw six
 * systems standing apart. Here the platform sits at the centre and the six domains are
 * wired to it, so the first glance carries the sentence: parts of one thing, not products
 * in a row. The shared capabilities sit under the hub as one quiet line, because they are
 * the reason the wiring works, not six more boxes.
 */
function HubVisual() {
  const bi = useBilingual();
  const domains = [
    { key: 'eservices', icon: 'ClipboardList' },
    { key: 'documents', icon: 'FileCheck2' },
    { key: 'gis', icon: 'Map' },
    { key: 'mis', icon: 'BarChart3' },
    { key: 'portal', icon: 'Globe' },
    { key: 'hr', icon: 'Users' },
  ] as const;
  const CX = 480, CY = 250, RX = 360, RY = 175;
  const pos = domains.map((_, i) => {
    const a = (Math.PI * 2 * i) / domains.length - Math.PI / 2;
    return { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a) };
  });
  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ aspectRatio: '960/560' }}>
      <svg viewBox="0 0 960 560" className="absolute inset-0 w-full h-full" role="presentation">
        {pos.map((p, i) => (
          <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y}
            stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 5" />
        ))}
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none"
          stroke="var(--accent)" strokeOpacity="0.12" strokeWidth="1.5" />
      </svg>

      {/* The hub. */}
      <div
        className="absolute"
        style={{ left: '50%', top: `${(CY / 560) * 100}%`, transform: 'translate(-50%, -50%)' }}
      >
      <div
        className="showcase-pop grid place-items-center text-center rounded-2xl bg-white ring-2 shadow-[0_18px_50px_-20px_rgb(15_23_42/.35)] px-6 py-4"
        style={{ ['--tw-ring-color' as string]: 'var(--accent)' }}
      >
        <img src={asset('logo-alameen.png')} alt="" className="w-40 sm:w-52 h-auto" />
        <span className="mt-1 text-sm sm:text-base font-black text-slate-800" dir="ltr">One Platform</span>
        <span className="text-xs sm:text-sm text-slate-500">منصة واحدة</span>
      </div>
      </div>

      {domains.map(({ key, icon }, i) => {
        const Icon = CHIP_ICONS[icon];
        return (
          <div
            key={key}
            className="absolute"
            style={{ left: `${(pos[i].x / 960) * 100}%`, top: `${(pos[i].y / 560) * 100}%`,
                     transform: 'translate(-50%, -50%)' }}
          >
          <div
            className="showcase-pop flex flex-col items-center justify-center text-center gap-1 rounded-xl bg-white ring-1 ring-slate-900/10 shadow-sm px-4 py-3 min-w-[9.5rem]"
            style={{ animationDelay: `${250 + i * 110}ms` }}
          >
            <Icon className="w-6 h-6" style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
            <span dir="ltr" className="text-sm font-black leading-tight text-slate-800">
              {bi(`showcase.ecosystem.${key}`).en}
            </span>
            <span className="text-xs leading-tight text-slate-500">
              {bi(`showcase.ecosystem.${key}`).ar}
            </span>
          </div>
          </div>
        );
      })}

      {/* Why the wiring works — one quiet line, not six more boxes. */}
      <p
        className="showcase-enter absolute inset-x-0 text-center text-xs sm:text-sm font-semibold text-slate-500"
        style={{ top: '96%' }}
      >
        هوية وصلاحيات موحدة · مسارات عمل موحدة · بيانات مشتركة · تقارير وتحليلات
      </p>
    </div>
  );
}
