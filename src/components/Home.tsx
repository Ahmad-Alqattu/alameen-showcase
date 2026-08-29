import { useI18n } from '../i18n'
import { SHOWCASE, productLogo } from '../data'
import { Wrap, SectionLabel } from './Chrome'
import { ClientsSection } from './Clients'
import { CoverageMap } from './CoverageMap'
import { AiSection } from './AiSection'

function Hero() {
  const { t, heroTitle } = useI18n()
  const nClients = SHOWCASE.clients.reduce((a, c) => a + c.items.length, 0)
  const nShots = SHOWCASE.products.reduce((a, p) => a + p.imgs.length, 0)
  const stats: [string, string][] = [
    ['2008', t('stat1')],
    [String(SHOWCASE.products.length), t('stat2')],
    [`${nClients}+`, t('stat3')],
    [`${nShots}+`, t('stat4')],
  ]
  return (
    <section className="pt-[clamp(34px,6vh,78px)] pb-[clamp(20px,3.5vh,44px)]">
      <Wrap>
        <div className="inline-flex items-center gap-3 font-mono text-[.78rem] font-semibold tracking-[.14em] text-brand uppercase mb-5 animate-rise [animation-delay:.05s] before:content-[''] before:w-[34px] before:h-0.5 before:bg-brand before:rounded">
          {t('overline')}
        </div>
        <h1 className="text-[clamp(2rem,4.4vw,3.8rem)] font-bold leading-[1.24] text-navy max-w-[21ch] animate-rise [animation-delay:.12s]">
          {heroTitle[0]}
          <em className="not-italic text-transparent bg-clip-text bg-gradient-to-l ltr:bg-gradient-to-r from-brand to-cyan">
            {heroTitle[1]}
          </em>
          {heroTitle[2]}
        </h1>
        <p className="mt-4.5 text-[clamp(.95rem,1.3vw,1.12rem)] font-light text-muted max-w-[64ch] leading-8 animate-rise [animation-delay:.2s]">
          {t('heroSub')}
        </p>
        <div className="flex flex-wrap gap-[clamp(16px,3vw,44px)] mt-[clamp(24px,4vh,40px)] animate-rise [animation-delay:.3s]">
          {stats.map(([v, l]) => (
            <div key={l} className="border-s-[3px] border-brand ps-4">
              <b className="block font-mono text-[clamp(1.5rem,2.5vw,2.1rem)] font-semibold text-navy tabular-nums tracking-tight">{v}</b>
              <span className="text-[.82rem] text-faint">{l}</span>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

function ProductsGrid() {
  const { t, L, Lx } = useI18n()
  return (
    <section className="py-[clamp(26px,4.5vh,56px)]">
      <Wrap id="products">
        <SectionLabel k="productsLabel" />
        <h2 className="text-[clamp(1.4rem,2.6vw,2.1rem)] font-bold text-navy mb-1.5">{t('productsH2')}</h2>
        <p className="text-[.95rem] text-muted font-light max-w-[70ch] leading-7">{t('productsSub')}</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(315px,1fr))] gap-4.5 mt-6.5">
          {SHOWCASE.products.map((p, i) => (
            <a
              key={p.slug}
              href={`#/p/${p.slug}`}
              style={{ animationDelay: `${0.05 + i * 0.05}s` }}
              className={`group relative flex flex-col gap-4 p-6 rounded-card bg-white border border-line shadow-card transition duration-300 hover:-translate-y-1.5 hover:border-brand/55 hover:shadow-card-lg animate-rise overflow-hidden text-start ${
                p.flagship
                  ? 'col-span-full md:flex-row md:items-center gap-7 !p-[30px] md:!px-[clamp(22px,3vw,42px)] bg-gradient-to-br from-[#eaf3fe] to-white border-brand/35'
                  : ''
              }`}
            >
              <div
                className={`flex-none rounded-[20px] bg-white border border-line shadow-[0_8px_22px_-10px_rgb(9_45_92/.22)] flex items-center justify-center p-3 ${
                  p.flagship ? 'w-[102px] h-[102px] rounded-3xl' : 'w-[84px] h-[84px]'
                }`}
              >
                <img loading="lazy" src={productLogo(p)} alt="" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex flex-col flex-1 gap-0 min-w-0">
                <h3 className={`font-semibold text-navy leading-[1.45] ${p.flagship ? 'text-[clamp(1.25rem,2.1vw,1.6rem)]' : 'text-[1.16rem]'}`}>
                  {L(p.name)}
                </h3>
                <div className="en-name text-[.78rem] text-brand font-medium tracking-wide mt-1">{Lx(p.name)}</div>
                <div className="text-[.86rem] text-muted font-light leading-7 mt-2">{L(p.tag)}</div>
                <div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
                  {p.flagship && (
                    <span className="tag text-[.72rem] px-3 py-1 rounded-full border border-brand/45 text-brand bg-brand/5 font-medium">
                      {t('flagBadge')}
                    </span>
                  )}
                  <span className="tag text-[.72rem] px-3 py-1 rounded-full border border-line-strong text-muted bg-[#fbfdff] font-medium">
                    {L(p.sector)}
                  </span>
                  <span className="count font-mono text-[.72rem] text-faint tabular-nums">
                    {p.imgs.length} {t('shots')}
                  </span>
                  <span className="ms-auto w-9 h-9 rounded-full border border-line-strong flex items-center justify-center text-muted transition group-hover:bg-brand group-hover:border-brand group-hover:text-white flex-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-4 h-4 rtl:-scale-x-100">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

function AboutSection() {
  const { t, L, lang } = useI18n()
  const c = SHOWCASE.company
  return (
    <section className="py-[clamp(26px,4.5vh,56px)]">
      <Wrap id="about">
        <SectionLabel k="aboutLabel" />
        <h2 className="text-[clamp(1.4rem,2.6vw,2.1rem)] font-bold text-navy mb-1.5">{t('aboutH2')}</h2>
        <div className="grid md:grid-cols-[1.15fr_.85fr] grid-cols-1 gap-[clamp(22px,3.5vw,52px)] mt-6.5">
          <div>
            <p className="text-[.98rem] font-light leading-8 text-muted">{L(c.about)}</p>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mt-7">
              {c.beneficiaries.map((b) => (
                <div key={b[1]} className="text-center py-5 px-2.5 rounded-2xl bg-gradient-to-b from-[#f0f6fd] to-white border border-line">
                  <b className="block font-mono text-[clamp(1.6rem,2.7vw,2.2rem)] font-semibold text-brand tabular-nums tracking-tight">
                    {b[0]}
                    {b[0].length < 4 ? '+' : ''}
                  </b>
                  <span className="text-[.78rem] text-muted leading-6 block mt-1">{lang === 'ar' ? b[1] : b[2]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {c.vision.map((v) => (
              <div key={v[0]} className="flex gap-3 items-start px-4 py-3 rounded-[14px] bg-white border border-line text-[.88rem] leading-7 text-ink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-[18px] h-[18px] text-brand flex-none mt-1">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m9 11 3 3L22 4" />
                </svg>
                <span>{L(v)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5 mt-7">
          {c.milestones.map((m) => (
            <div
              key={m[0]}
              className="relative p-4.5 rounded-2xl bg-white border border-line before:content-[''] before:absolute before:top-0 before:start-0 before:w-11 before:h-[3px] before:bg-gradient-to-r before:from-brand before:to-cyan before:rounded-b"
            >
              <b className="font-mono text-[1.3rem] font-semibold text-brand tabular-nums tracking-tight">{m[0]}</b>
              <p className="text-[.83rem] text-muted leading-7 mt-1.5">{lang === 'ar' ? m[1] : m[2]}</p>
            </div>
          ))}
        </div>
        <SectionLabel k="projectsLabel" className="mt-10" />
        <div className="grid md:grid-cols-2 grid-cols-1 gap-2.5 mt-6.5">
          {c.projects.map((p) => (
            <div
              key={p[0]}
              className="flex gap-3 items-start px-4 py-3.5 rounded-[14px] bg-white border border-line transition hover:border-brand/50 before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-cyan before:mt-2.5 before:flex-none"
            >
              <div>
                <div className="text-[.86rem] text-ink leading-7 font-medium">{lang === 'ar' ? p[0] : p[2]}</div>
                <div className="text-[.74rem] text-brand mt-1 font-medium">{lang === 'ar' ? p[1] : p[3]}</div>
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

function Partners() {
  const { L } = useI18n()
  return (
    <>
      <SectionLabel k="partnersLabel" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5 mt-6">
        {SHOWCASE.partners.map((p) => (
          <div
            key={p.n[1]}
            title={L(p.n)}
            className="flex items-center justify-center h-24 p-4 rounded-2xl bg-white border border-line transition hover:border-brand/50 hover:shadow-card"
          >
            {p.l ? (
              <img loading="lazy" src={`./assets/clients/${p.l}`} alt={p.n[1]} className="max-h-14 max-w-[80%] object-contain" />
            ) : (
              <b>{L(p.n)}</b>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export function Home() {
  const { t } = useI18n()
  return (
    <main>
      <Hero />
      <ProductsGrid />
      <AiSection />
      <AboutSection />
      <section className="py-[clamp(26px,4.5vh,56px)]">
        <Wrap id="clients">
          <SectionLabel k="clientsLabel" />
          <h2 className="text-[clamp(1.4rem,2.6vw,2.1rem)] font-bold text-navy mb-1.5">{t('clientsH2')}</h2>
          <p className="text-[.95rem] text-muted font-light max-w-[70ch] leading-7">{t('clientsSub')}</p>
          <ClientsSection />
          <SectionLabel k="covLabel" className="mt-12" />
          <h2 className="text-[clamp(1.4rem,2.6vw,2.1rem)] font-bold text-navy mb-1.5">{t('covH2')}</h2>
          <p className="text-[.95rem] text-muted font-light max-w-[70ch] leading-7">{t('covSub')}</p>
          <CoverageMap />
        </Wrap>
      </section>
      <section className="pb-[clamp(26px,4.5vh,56px)]">
        <Wrap>
          <Partners />
        </Wrap>
      </section>
    </main>
  )
}
