import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Minus, Locate } from 'lucide-react';
import {
  MAP_W,
  MAP_H,
  GOVERNORATES,
  DEPLOYMENTS,
  KIND_COLOR,
  type Deployment,
  type DeploymentKind,
} from './mapData';
import { asset } from './assetUrl';

/**
 * The coverage map — the interactive one, not a picture of it.
 *
 * A port of the map in the company's own showcase (`alameen-showcase/index.html`): drag to pan,
 * wheel or pinch to zoom, and every site is a real pin carrying that client's mark, coloured by
 * what they run. A static outline with dots on it answered "roughly where"; this answers "who, and
 * what do they run", which is the only version worth putting in front of a client.
 *
 * Two things it does that the original could not, because the original was not inside a deck:
 * it reports interaction upward so the slideshow stops advancing under someone's hand, and it
 * returns to the home view whenever the slide comes back around.
 */

const HOME = { x: -MAP_W * 0.03, y: -MAP_H * 0.02, w: MAP_W * 1.06, h: MAP_H * 1.04 };
const KIND_ORDER: DeploymentKind[] = ['csc', 'both', 'mad', 'water'];

/** The teardrop the source map draws, in its own 24×34 space. */
const PIN_PATH = 'M12 0C5.37 0 0 5.37 0 12c0 8.6 12 22 12 22s12-13.4 12-22C24 5.37 18.63 0 12 0z';

interface View { x: number; y: number; w: number; h: number }

export default function CoverageMap({ onInteract }: { onInteract?: () => void }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const overview = new URLSearchParams(window.location.search).get('deck') === 'overview';
  const lang = isAr ? 0 : 1;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(HOME);
  const [hovered, setHovered] = useState<Deployment | null>(null);
  const [dragging, setDragging] = useState(false);
  // The pin scale is capped in SCREEN pixels, so it needs the wrapper's rendered width. Measured
  // into state rather than read off the ref during render, which would make the first paint depend
  // on a value React has not committed yet.
  const [wrapBox, setWrapBox] = useState({ w: 1200, h: 700 });

  // Pointer bookkeeping lives in refs: it changes on every move and must not re-render.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const lastPan = useRef<{ x: number; y: number } | null>(null);
  const lastDist = useRef<number | null>(null);

  const clamp = useCallback((v: View): View => {
    const w = Math.max(MAP_W * 0.06, Math.min(MAP_W * 1.3, v.w));
    const h = w * (HOME.h / HOME.w);
    return {
      w,
      h,
      x: Math.max(-MAP_W * 0.5, Math.min(MAP_W * 1.1 - w * 0.4, v.x)),
      y: Math.max(-MAP_H * 0.5, Math.min(MAP_H * 1.1 - h * 0.4, v.y)),
    };
  }, []);

  /** Zoom about a point in client coordinates, so the spot under the cursor stays put. */
  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    onInteract?.();
    setHovered(null);
    setView((v) => {
      const sx = v.x + ((px - r.left) / r.width) * v.w;
      const sy = v.y + ((py - r.top) / r.height) * v.h;
      const zoomed = clamp({ ...v, w: v.w * factor });
      return clamp({
        ...zoomed,
        x: sx - ((px - r.left) / r.width) * zoomed.w,
        y: sy - ((py - r.top) / r.height) * zoomed.h,
      });
    });
  }, [clamp, onInteract]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWrapBox({ w: el.clientWidth || 1200, h: el.clientHeight || 700 });
    const ro = new ResizeObserver(([entry]) =>
      setWrapBox({ w: entry.contentRect.width || 1200, h: entry.contentRect.height || 700 }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Wheel has to be a non-passive native listener; React's onWheel cannot preventDefault.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 1.18 : 1 / 1.18);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      lastPan.current = { x: e.clientX, y: e.clientY };
      setDragging(true);
    }
    (e.target as Element).setPointerCapture?.(e.pointerId);
    onInteract?.();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;

    if (pointers.current.size === 1 && lastPan.current) {
      const dx = e.clientX - lastPan.current.x;
      const dy = e.clientY - lastPan.current.y;
      lastPan.current = { x: e.clientX, y: e.clientY };
      setView((v) => clamp({ ...v, x: v.x - (dx / r.width) * v.w, y: v.y - (dy / r.height) * v.h }));
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (lastDist.current) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, lastDist.current / dist);
      lastDist.current = dist;
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) lastDist.current = null;
    if (pointers.current.size === 0) {
      lastPan.current = null;
      setDragging(false);
    }
  };

  const zoomFromCentre = (factor: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
  };

  // Pins grow with the zoom but never swallow the map, and never shrink out of sight — the same
  // sqrt curve and screen-pixel caps the source map uses.
  const k = view.w / MAP_W;
  // `preserveAspectRatio="meet"` letterboxes the map inside the box, so the drawn width is not the
  // box width — sizing pins off the box made them ~8px wide and the logos in them invisible.
  const drawnW = Math.min(wrapBox.w, wrapBox.h * (view.w / view.h));
  const pxPerUnit = drawnW / view.w;
  // Floor and ceiling are in SCREEN pixels: a pin is never narrower than 30px (below that a logo is
  // a smudge) and never wider than 92px (above that it swallows the governorate under it).
  const pinScale = Math.max(30 / (24 * pxPerUnit), Math.min(92 / (24 * pxPerUnit), 1.1 * Math.sqrt(k)));

  const counts = KIND_ORDER.map((kind) => ({ kind, n: DEPLOYMENTS.filter((d) => d.kind === kind).length }))
    .filter((c) => c.n > 0);

  return (
    <div className="relative w-full h-full flex flex-col gap-3 min-h-0">
      <div
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        className={`relative flex-1 min-h-0 rounded-xl bg-white ring-1 ring-slate-900/8 overflow-hidden touch-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <svg
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
          role="presentation"
        >
          <defs>
            {DEPLOYMENTS.map((d, i) =>
              d.logo ? (
                <clipPath key={i} id={`coverage-pin-${i}`}>
                  <circle cx={12} cy={12} r={8.6} />
                </clipPath>
              ) : null,
            )}
          </defs>

          {GOVERNORATES.map((g, i) => (
            <path
              key={g.code}
              className="showcase-draw"
              style={{ animationDelay: `${i * 70}ms`, animationDuration: '800ms' }}
              d={g.d}
              fill={g.fill}
              stroke="#ffffff"
              strokeWidth={1.2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Labels only where the shape can hold one — the source's own area threshold. */}
          {GOVERNORATES.filter((g) => g.area >= 400).map((g) => (
            <text
              key={`l-${g.code}`}
              x={g.cx}
              y={g.cy}
              textAnchor="middle"
              fontSize={13 * k}
              className="fill-slate-500 font-semibold pointer-events-none select-none"
            >
              {g.name[lang]}
            </text>
          ))}

          {DEPLOYMENTS.map((d, i) => (
            <circle
              key={`halo-${i}`}
              cx={d.x}
              cy={d.y}
              r={(d.logo ? 12 : 7) * k}
              fill={KIND_COLOR[d.kind]}
              opacity={0.18}
            />
          ))}

          {DEPLOYMENTS.map((d, i) => (
            // Two groups on purpose. A CSS transform overrides an SVG `transform` attribute, so
            // an entrance animation ending on `transform: none` silently drops the pin's own
            // placement and lands it at the origin. The outer group owns position and scale; the
            // inner one owns the animation, and the two can never fight.
            <g
              key={`pin-${i}`}
              transform={`translate(${d.x} ${d.y}) scale(${pinScale.toFixed(3)}) translate(-12 -34)`}
              className="cursor-pointer"
              onPointerEnter={() => setHovered(d)}
              onPointerLeave={() => setHovered((h) => (h === d ? null : h))}
              onPointerDown={(e) => { e.stopPropagation(); setHovered(d); onInteract?.(); }}
            >
              <g className="showcase-drop" style={{ animationDelay: `${1400 + i * 32}ms` }}>
              <path d={PIN_PATH} fill={KIND_COLOR[d.kind]} stroke="#ffffff" strokeWidth={1.4} />
              <circle cx={12} cy={12} r={9.3} fill="#ffffff" />
              {d.logo ? (
                <image
                  href={asset(`showcase/clients/${d.logo}`)}
                  x={3.4}
                  y={3.4}
                  width={17.2}
                  height={17.2}
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={`url(#coverage-pin-${i})`}
                  style={{ pointerEvents: 'none' }}
                />
              ) : (
                <circle cx={12} cy={12} r={4.4} fill={KIND_COLOR[d.kind]} />
              )}
              </g>
            </g>
          ))}
        </svg>

        {/* Who this pin is. Anchored to the top-start corner so it never has to be measured. */}
        {hovered && (
          <div className="showcase-enter absolute top-3 start-3 max-w-[15rem] rounded-xl bg-white/95 backdrop-blur ring-1 ring-slate-900/10 shadow-lg p-3 pointer-events-none">
            {hovered.logo && (
              <img
                src={asset(`showcase/clients/${hovered.logo}`)}
                alt=""
                className="h-11 max-w-[7rem] object-contain mx-auto mb-2"
              />
            )}
            <p className="text-sm font-bold text-slate-800 leading-snug">{hovered.name[lang]}</p>
            <p className="text-[11px] text-slate-400">{hovered.governorate[lang]}</p>
            <span
              className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: KIND_COLOR[hovered.kind] }}
            >
              {t(`showcase.mapKinds.${hovered.kind}`)}
            </span>
          </div>
        )}

        {!overview && <div className="absolute top-3 end-3 flex flex-col gap-1.5">
          <MapButton label={t('showcase.zoomIn')} onClick={() => zoomFromCentre(1 / 1.45)}><Plus className="w-4 h-4" /></MapButton>
          <MapButton label={t('showcase.zoomOut')} onClick={() => zoomFromCentre(1.45)}><Minus className="w-4 h-4" /></MapButton>
          <MapButton label={t('showcase.resetView')} onClick={() => { onInteract?.(); setHovered(null); setView(HOME); }}><Locate className="w-4 h-4" /></MapButton>
        </div>}
      </div>

      {/* Legend, with the count of sites in each category. */}
      <div className="shrink-0 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {counts.map(({ kind, n }) => (
          <span key={kind} className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: KIND_COLOR[kind] }} />
            {t(`showcase.mapKinds.${kind}`)}
            <b className="text-slate-900 tabular-nums">{n}</b>
          </span>
        ))}
        {!overview && <span className="text-[11px] text-slate-400">{t('showcase.mapHint')}</span>}
      </div>
    </div>
  );
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid place-items-center w-8 h-8 rounded-lg bg-white ring-1 ring-slate-900/10 text-slate-500 hover:text-slate-900 shadow-sm transition-colors"
    >
      {children}
    </button>
  );
}
