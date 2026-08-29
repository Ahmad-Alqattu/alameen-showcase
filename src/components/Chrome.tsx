import type { ReactNode } from 'react'
import { useI18n, type DictKey } from '../i18n'
import { goHome } from '../hooks/useHashRoute'

export function Atmo() {
  return (
    <>
      <div className="atmo fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute -inset-[20%] w-[140%] h-[140%] opacity-55"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="#9cc3ec"
          strokeWidth="1"
          opacity=".4"
        >
          <path d="M-100 120 C 200 60, 420 200, 700 140 S 1150 60, 1350 150" />
          <path d="M-100 190 C 200 130, 430 270, 710 210 S 1160 130, 1360 220" />
          <path d="M-100 260 C 200 200, 440 340, 720 280 S 1170 200, 1370 290" />
          <path d="M-100 430 C 220 370, 460 500, 740 445 S 1180 370, 1380 460" />
          <path d="M-100 500 C 220 440, 470 570, 750 515 S 1190 440, 1390 530" />
          <path d="M-100 670 C 240 610, 490 740, 770 685 S 1200 610, 1400 700" />
          <path d="M-100 740 C 240 680, 500 810, 780 755 S 1210 680, 1410 770" />
        </svg>
      </div>
    </>
  )
}

export function Wrap({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`max-w-[1500px] mx-auto px-[clamp(20px,4vw,56px)] ${className}`}>
      {children}
    </div>
  )
}

export function SectionLabel({ k, className = '' }: { k: DictKey; className?: string }) {
  const { t } = useI18n()
  return (
    <div
      className={`flex items-center gap-4 mb-2 font-mono text-[.78rem] tracking-[.14em] text-brand uppercase font-semibold after:content-[''] after:flex-1 after:h-px after:bg-gradient-to-r after:from-line-strong after:to-transparent ${className}`}
    >
      {t(k)}
    </div>
  )
}

export function Topbar() {
  const { t, toggle } = useI18n()
  const anchors: [DictKey, string][] = [
    ['navProducts', 'products'],
    ['navAi', 'ai'],
    ['navAbout', 'about'],
    ['navClients', 'clients'],
    ['navContact', 'contact'],
  ]
  const go = (id: string) => {
    goHome()
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60)
  }
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-line">
      <Wrap className="flex items-center justify-between gap-3.5 py-3.5">
        <a href="#/" aria-label="Al-Ameen Technologies">
          <img className="h-9 block" src="./assets/logo-alameen.svg" alt="Al-Ameen Technologies" />
        </a>
        <nav className="hidden md:flex items-center gap-1 flex-wrap">
          {anchors.map(([k, id]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="px-4 py-2 rounded-full text-[.86rem] font-medium text-muted transition hover:text-brand hover:bg-brand/10"
            >
              {t(k)}
            </button>
          ))}
        </nav>
        <div className="flex gap-2 items-center">
          <a
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[.84rem] font-semibold border border-line-strong text-muted transition hover:border-brand hover:text-brand"
            href="https://alameentech.com"
            target="_blank"
            rel="noopener"
          >
            alameentech.com
          </a>
          <button
            onClick={toggle}
            className="px-4 py-2 rounded-full text-[.84rem] font-semibold bg-brand text-white transition hover:bg-brand-dark hover:shadow-[0_8px_22px_-8px_rgb(0_120_233/.55)]"
          >
            {t('langBtn')}
          </button>
        </div>
      </Wrap>
    </header>
  )
}

export function Footer() {
  const { L } = useI18n()
  const hq: [string, string] = [
    'عمارة الزيتونة – الطابق الرابع، شارع الإرسال، رام الله – فلسطين',
    'Al-Zaytouna Building, 4th Floor – Al-Irsal Street, Ramallah, Palestine',
  ]
  return (
    <footer id="contact" className="mt-[clamp(26px,5vh,60px)] bg-gradient-to-br from-[#03203d] to-navy text-[#eaf3fc]">
      <Wrap className="grid md:grid-cols-[auto_1fr_auto] grid-cols-1 gap-[clamp(20px,4vw,60px)] items-center py-9 md:text-start text-center md:justify-items-start justify-items-center">
        <img className="h-8" src="./assets/logo-alameen-white.svg" alt="" />
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[.86rem] text-[#b8cfe8] font-light justify-center">
          <a className="hover:text-white transition" href="https://alameentech.com" target="_blank" rel="noopener">
            alameentech.com
          </a>
          <a className="hover:text-white transition" href="mailto:Info@alameentech.com">
            Info@alameentech.com
          </a>
          <a className="hover:text-white transition" href="tel:+970599206305">
            <span dir="ltr">+970 599 206 305</span>
          </a>
          <a className="hover:text-white transition" href="tel:+97022988555">
            <span dir="ltr">+970 2 2988555</span>
          </a>
        </div>
        <div className="text-[.8rem] text-[#8fb0d4] font-light leading-7 max-w-[34ch]">{L(hq)}</div>
      </Wrap>
    </footer>
  )
}
