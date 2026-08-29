import { useState } from 'react'
import { useI18n } from '../i18n'
import { SHOWCASE, clientLogo } from '../data'

/** Strip the entity-type prefix so the monogram letter is the distinctive one. */
const monogram = (name: string) =>
  name.replace(/^(بلدية|شركة|جامعة|وزارة|هيئة|مصلحة|مؤسسة|صحيفة)\s*/, '').charAt(0)

export function ClientsSection() {
  const { L, Lx } = useI18n()
  const [tab, setTab] = useState(0)
  return (
    <>
      <div className="flex gap-2 flex-wrap mt-6">
        {SHOWCASE.clients.map((c, i) => (
          <button
            key={c.key}
            onClick={() => setTab(i)}
            className={`px-5 py-2.5 rounded-full text-[.86rem] font-semibold border transition ${
              i === tab
                ? 'bg-navy border-navy text-white shadow-[0_8px_20px_-8px_rgb(0_40_78/.5)]'
                : 'border-line-strong text-muted bg-white hover:border-brand hover:text-brand'
            }`}
          >
            {L(c.title)}
            <span className="opacity-65 font-mono font-normal text-[.76rem] ms-1.5 tabular-nums">{c.items.length}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-3 mt-5.5">
        {SHOWCASE.clients[tab].items.map((it, i) => (
          <div
            key={it.n[1]}
            style={{ animationDelay: `${i * 0.018}s` }}
            className="flex flex-col items-center gap-2.5 text-center px-3 pt-4.5 pb-3.5 rounded-2xl bg-white border border-line transition duration-300 hover:-translate-y-1 hover:border-brand/50 hover:shadow-card animate-rise"
          >
            <div className="h-16 flex items-center justify-center">
              {it.l ? (
                <img loading="lazy" src={clientLogo(it.l)} alt="" className="max-h-16 max-w-[120px] object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#e8f2fd] to-[#d7e9fb] text-brand font-bold text-[1.35rem] border border-line-strong">
                  {monogram(L(it.n))}
                </div>
              )}
            </div>
            <div>
              <div className="text-[.8rem] font-semibold text-ink leading-6">{L(it.n)}</div>
              <div className="cl-en text-[.68rem] text-faint leading-5">{Lx(it.n)}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
