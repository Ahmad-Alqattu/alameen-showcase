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
          <img className="h-14 block" src="./assets/logo-alameen.png" alt="Al-Ameen Technologies" />
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

/**
 * The closing section, not a strip. It is where the nav's "Contact" lands and
 * the last thing a visitor reads, so it carries an invitation and labelled
 * contact details rather than an undifferentiated row of numbers.
 */
export function Footer() {
  const { L, lang } = useI18n()

  const cta: [string, string] = [
    'نعرض لك المنصة على بياناتك',
    'We will show you the platform on your own data',
  ]
  const ctaSub: [string, string] = [
    'اطلب عرضاً، أو مرّ علينا — نجهّز لك بيئة تجريبية بأرقام مؤسستك خلال أيام.',
    'Ask for a walkthrough, or come and see us — we set up a trial environment on your organization’s own figures within days.',
  ]

  /** [label, value, href, ltr?] */
  const rows: [[string, string], string, string, boolean][] = [
    [['البريد الإلكتروني', 'Email'], 'Info@alameentech.com', 'mailto:Info@alameentech.com', true],
    [['الجوال', 'Mobile'], '+970 599 206 305', 'tel:+970599206305', true],
    [['هاتف المكتب', 'Office'], '+970 2 2988555', 'tel:+97022988555', true],
    [['الموقع', 'Website'], 'alameentech.com', 'https://alameentech.com', true],
  ]

  const hqLines: [string, string][] = [
    ['عمارة الزيتونة – الطابق الرابع', 'Al-Zaytouna Building, 4th Floor'],
    ['شارع الإرسال', 'Al-Irsal Street'],
    // kept on one line: a city name must never break across two
    ['رام الله – فلسطين', 'Ramallah, Palestine'],
  ]

  return (
    <footer id="contact" className="mt-[clamp(30px,5vh,64px)] bg-gradient-to-br from-[#03203d] to-navy text-[#eaf3fc]">
      <Wrap className="pt-[clamp(38px,6vh,70px)] pb-8">
        <div className="grid lg:grid-cols-[1.1fr_1fr] grid-cols-1 gap-[clamp(28px,5vw,72px)]">
          {/* the invitation */}
          <div>
            <div className="font-mono text-[.78rem] font-semibold tracking-[.14em] uppercase text-cyan mb-4">
              {L(['تواصل معنا', 'Get in touch'])}
            </div>
            <h2 className="text-[clamp(1.4rem,2.6vw,2.1rem)] font-bold leading-[1.35] max-w-[20ch]">{L(cta)}</h2>
            <p className="mt-3.5 text-[.92rem] font-light leading-8 text-[#b0cbe6] max-w-[46ch]">{L(ctaSub)}</p>
            <a
              href="mailto:Info@alameentech.com"
              className="mt-6 inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-cyan text-navy font-bold text-[.95rem] transition hover:bg-white"
            >
              {L(['راسلنا', 'Email us'])}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-4 h-4 rtl:-scale-x-100">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* labelled details — which number is which should never be a guess */}
          <div className="grid sm:grid-cols-2 grid-cols-1 gap-x-8 gap-y-5 content-start">
            {rows.map(([label, value, href, ltr]) => (
              <div key={value}>
                <div className="font-mono text-[.68rem] tracking-[.13em] uppercase text-[#7fa3c6] mb-1">{L(label)}</div>
                <a
                  href={href}
                  {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
                  className="text-[.95rem] font-medium hover:text-cyan transition"
                  dir={ltr ? 'ltr' : undefined}
                  style={ltr && lang === 'ar' ? { display: 'block', textAlign: 'right' } : undefined}
                >
                  {value}
                </a>
              </div>
            ))}
            <div className="sm:col-span-2">
              <div className="font-mono text-[.68rem] tracking-[.13em] uppercase text-[#7fa3c6] mb-1">
                {L(['المقر الرئيسي', 'Headquarters'])}
              </div>
              <address className="not-italic text-[.92rem] font-light leading-7 text-[#b0cbe6]">
                {hqLines.map((l) => (
                  <span key={l[1]} className="block">{L(l)}</span>
                ))}
              </address>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(30px,5vh,54px)] pt-6 border-t border-white/12 flex flex-wrap items-center justify-between gap-5">
          <img className="h-12" src="./assets/logo-alameen-white.png" alt="Al-Ameen Technologies" />
          <div className="font-mono text-[.72rem] text-[#7fa3c6]">
            © {new Date().getFullYear()} {L(['الأمين للتقنيات', 'Al-Ameen Technologies'])}
          </div>
        </div>
      </Wrap>
    </footer>
  )
}
