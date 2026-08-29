import { useI18n } from '../i18n'
import { clientLogo } from '../data'
import type { AppEntry, Portal } from '../types'

/**
 * Live client portals.
 *
 * Deliberately NOT an iframe. Every portal is served over plain HTTP on a raw
 * IP, so an HTTPS page cannot embed one — browsers block mixed content
 * outright — and at a stand with no connectivity an iframe is a blank box.
 * The screenshot carries the proof offline; the link is there for the visitor
 * who wants to open the real thing in their own tab.
 */
function PortalGrid({ portals }: { portals: Portal[] }) {
  const { L } = useI18n()
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4 mt-6">
      {portals.map((p, i) => {
        const linked = !!p.url
        const Tag = (linked ? 'a' : 'div') as 'a'
        return (
          <Tag
            key={p.shot}
            {...(linked ? { href: p.url as string, target: '_blank', rel: 'noopener noreferrer' } : {})}
            style={{ animationDelay: `${i * 0.03}s` }}
            className={`group flex flex-col rounded-card overflow-hidden bg-white border border-line shadow-card animate-rise ${
              linked
                ? 'transition duration-300 hover:-translate-y-1 hover:border-brand/55 hover:shadow-card-lg'
                : ''
            }`}
          >
            <div className="relative overflow-hidden bg-tint border-b border-line aspect-[16/10]">
              <img
                loading="lazy"
                decoding="async"
                src={`./assets/portals/${p.shot}`}
                width={p.w}
                height={p.h}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover object-top ${
                  linked ? 'transition duration-500 group-hover:scale-[1.03]' : ''
                }`}
              />
            </div>
            <div className="flex items-center gap-3 p-3.5">
              <img loading="lazy" src={clientLogo(p.l)} alt="" className="w-10 h-10 object-contain flex-none" />
              <div className="min-w-0 flex-1">
                <div className="text-[.88rem] font-semibold text-navy leading-snug truncate">{L(p.n)}</div>
                <div className="font-mono text-[.7rem] text-faint">{p.gov}</div>
              </div>
              {linked && (
                <span className="flex-none w-8 h-8 rounded-full border border-line-strong flex items-center justify-center text-muted transition group-hover:bg-brand group-hover:border-brand group-hover:text-white">
                  {/* opens elsewhere — an outward arrow, not a forward one */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <path d="M15 3h6v6M10 14 21 3" />
                  </svg>
                </span>
              )}
            </div>
          </Tag>
        )
      })}
    </div>
  )
}

/** Citizen-facing portals: screenshot for offline, link for the curious. */
export function Portals({ portals }: { portals: Portal[] }) {
  const { t } = useI18n()
  return (
    <div className="mt-7">
      <div className="flex items-baseline gap-4 flex-wrap mb-1.5">
        <h3 className="text-[clamp(1.1rem,2vw,1.5rem)] font-bold text-navy">{t('portalsH')}</h3>
        <span className="font-mono text-[.78rem] text-faint tabular-nums">{portals.length}</span>
      </div>
      <p className="text-[.92rem] text-muted font-light leading-8 max-w-[70ch]">{t('portalsSub')}</p>
      <PortalGrid portals={portals} />
      <p className="mt-4 font-mono text-[.72rem] text-faint">{t('portalsNote')}</p>
    </div>
  )
}

/**
 * Staff-facing systems, kept apart from the citizen portals on purpose: these
 * are internal, so they are shown as a screenshot and carry no outward link.
 */
export function StaffSystems({ systems }: { systems: Portal[] }) {
  const { t } = useI18n()
  return (
    <div className="mt-10">
      <div className="flex items-baseline gap-4 flex-wrap mb-1.5">
        <h3 className="text-[clamp(1.1rem,2vw,1.5rem)] font-bold text-navy">{t('staffH')}</h3>
        <span className="font-mono text-[.78rem] text-faint tabular-nums">{systems.length}</span>
      </div>
      <p className="text-[.92rem] text-muted font-light leading-8 max-w-[70ch]">{t('staffSub')}</p>
      <PortalGrid portals={systems} />
    </div>
  )
}

/**
 * The same clients on the phone. Screenshots come from each app's own store
 * listing, which also carries "Alameen Technologies" as the publisher — the
 * listing is itself the provenance.
 */
export function Apps({ apps }: { apps: AppEntry[] }) {
  const { L, t } = useI18n()
  return (
    <div className="mt-10">
      <div className="flex items-baseline gap-4 flex-wrap mb-1.5">
        <h3 className="text-[clamp(1.1rem,2vw,1.5rem)] font-bold text-navy">{t('appsH')}</h3>
        <span className="font-mono text-[.78rem] text-faint tabular-nums">{apps.length}</span>
      </div>
      <p className="text-[.92rem] text-muted font-light leading-8 max-w-[70ch]">{t('appsSub')}</p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 mt-6">
        {apps.map((a, i) => (
          <a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ animationDelay: `${i * 0.03}s` }}
            className="group flex flex-col rounded-card overflow-hidden bg-white border border-line shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand/55 hover:shadow-card-lg animate-rise"
          >
            <div className="relative flex justify-center gap-2 px-4 pt-5 pb-3 bg-gradient-to-b from-tint to-white overflow-hidden h-[190px]">
              {a.shots.slice(0, 3).map((sh, n) => (
                <img
                  key={sh.f}
                  loading="lazy"
                  decoding="async"
                  src={`./assets/apps/${sh.f}`}
                  alt=""
                  className={`h-full w-auto object-contain object-top rounded-lg transition duration-500 group-hover:-translate-y-1 ${
                    n === 0 ? '' : 'hidden sm:block opacity-70'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-3 p-3.5 border-t border-line">
              <img loading="lazy" src={`./assets/apps/${a.icon}`} alt="" className="w-10 h-10 rounded-lg object-contain flex-none" />
              <div className="min-w-0 flex-1">
                <div className="text-[.88rem] font-semibold text-navy leading-snug truncate">{L(a.n)}</div>
                <div className="font-mono text-[.7rem] text-faint">Google Play</div>
              </div>
              <span className="flex-none w-8 h-8 rounded-full border border-line-strong flex items-center justify-center text-muted transition group-hover:bg-brand group-hover:border-brand group-hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <path d="M15 3h6v6M10 14 21 3" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
